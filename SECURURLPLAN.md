# Plan: Device-bound, time-boxed table sessions for QR ordering

## Problem

The QR-code URL is a **permanent bearer credential**. The encrypted payload is only
`{ tableId, organizationId }` — no timestamp, expiry, nonce, or session id
(`table.logic.ts:299`). The token is written once into `table.qr_token` and **never
rotates** (`generateQrToken`, `table.logic.ts:289`). The public decode endpoint
`GET /organization/table/token/decode` has no auth, no expiry, no rate limit; its only
check `table.qrToken === token` is always true. After decode the client throws the token
away and orders against the raw `table.id` via `POST /organization/orders/table/{tableId}`,
which has no presence/session gate. client-web even writes
`localStorage["last-visited"] = token` and **auto-reopens the same table** on the next
visit (`table-provider.tsx:23`).

Result: any device that ever saw the URL can order indefinitely, from anywhere.

## Chosen approach (decided with user)

- **Presence proof:** Time-box + device-bind (zero friction, no staff step, no table code).
- **Browse access:** Lock the whole thing — menu/decode also gated, not just ordering.

The printed QR stays static; *access* is what expires. Security comes from a live,
device-bound, time-boxed session cookie issued at scan.

## Goal & guarantees

- **G1 Time-box** — session valid only within an **idle window** (touched on activity) and
  an **absolute cap**. Orders/menu refused after either lapses.
- **G2 Device-bind** — access requires an `HttpOnly` encrypted cookie issued at scan. The
  raw URL string alone (curl, shared text, bot) cannot browse or order.
- **G3 Lifecycle kill** — cookie is bound to the `table_session` id; checkout/close flips it
  `completed` → cookie instantly fails validation. Ordering after the bill is paid requires
  a fresh scan. (No cookie deletion needed — the middleware's `status = active` check does it.)
- **G4 Visibility** — a session flips the table `occupied` + emits the existing
  `table.status` realtime event, so any off-site abuse shows as staff-visible phantom
  occupancy (which they can close → G3).

**Accepted residual** (inherent to the zero-friction / no-staff choice): within a live
window the scanning phone keeps ordering, and a fresh off-site scan of the URL can still
open a *new* session — but it auto-expires (G1) and is visible/closeable (G4). Closing that
fully would require the staff-activate or table-code option.

## Behavior change to confirm in review

Because of "lock the whole thing" + zero-friction, **scanning = being seated**: `decode`
will create/join a session and mark the table `occupied`. An idle passerby scan therefore
seats the table (auto-expires later). If we'd rather only *occupy on first order*, that's a
one-line switch.

## Windows (configurable)

`IDLE_WINDOW = 45 min`, `ABSOLUTE_CAP = 4 h`. Centralized as constants.

---

## Changes

### 1. Schema + migration — `apps/api/src/core/db/schemas/table.ts`
Add to `tableSession`: `lastActivityAt timestamp` and `expiresAt timestamp` (absolute cap).
Device id lives *inside* the encrypted cookie (multiple phones per table → not a single
column). Generate migration into root `drizzle/` via `bun run db:generate`; backfill
existing `active` rows `expiresAt = createdAt + ABSOLUTE_CAP`. (`db:migrate` is the user's
to run.)

### 2. Cookie/credential util — `apps/api/src/lib/table-session-cookie.ts` (new)
Wraps `cryptoUtil` (AES-256-GCM, `ENCRYPTION_KEY`) to encrypt/decrypt
`{ sid, tableId, organizationId, deviceId, exp }`. Constants for cookie name (`rp_ts`) +
attributes (`HttpOnly`, `SameSite=Lax`, `Secure` in prod, explicit `Path`, **no `Domain`**
— the Next.js `/api` rewrite makes it same-origin from the browser). First use of
`hono/cookie` in the codebase.

### 3. `decodeQrToken` becomes the session issuer — `table.route.ts:153` + `table.logic.ts:330`
Handler switches to a `(c)` that can read/set cookies. New logic: validate QR (as today) →
**lazy-expire** any past-cap active session (mark completed, free table) → if a valid cookie
resumes an active/unexpired session for this table, touch it; else **join** an existing
active session or **create** one (occupy table + emit `table.status`) → `setCookie` → return
org/table. Also fix the existing 500→400 on bad token while here.

### 4. New middleware — `apps/api/src/middleware/table-session.ts` (new)
Mirrors `session.ts`. Reads cookie → decrypts → asserts `tableId`/`org` match the route
param/body, session row exists, `status = active`, `now < expiresAt`,
`now < lastActivityAt + IDLE`. Lazy-expires stale sessions. On fail → `401` with a
machine-readable `{ code: "TABLE_SESSION_INVALID" }`. On success → `c.set("tableSession", …)`,
touch `lastActivityAt`. Extend `AppEnv.Variables` in `index.ts` with `tableSession`.

### 5. Apply the gate inline (matching per-route convention — no router-level `.use()`)
- `orders.route.ts`: `POST /table/:tableId` (91), **`POST /` (102 — the bypass path)**,
  `GET /table/:tableId/active` (55), `GET /:id` (73), `GET /:orderId/invoice` (218).
- `menu.route.ts`: `GET /all/:organizationId` (the menu fetch) — realizes "lock the whole thing."
- `createOrAppend` (`orders.logic.ts:558`): use the middleware-provided `sid` (append)
  instead of trusting the body; stamp `lastActivityAt`.

### 6. client-web
- **Remove `last-visited` auto-reopen** (`table-provider.tsx:22-24`, `app/page.tsx`) — it
  directly re-arms reuse.
- Add a **"session ended — rescan at your table"** gate screen when any gated call returns
  `TABLE_SESSION_INVALID`, shown instead of menu/cart (the visible "lock").
- Confirm order/menu/active hooks ride `withCredentials` (already `true`) so the cookie
  flows through the proxy.

### 7. Shared — `packages/shared`
Add `IDLE_WINDOW` / `ABSOLUTE_CAP` constants and the `TABLE_SESSION_INVALID` error code so
client + API agree (schema-first).

---

## Verification

- **Reuse-later**: scan → order OK; wait past window (or temp-set 1 min) → order/menu `401`,
  gate screen shows. ✅ G1
- **Raw-URL replay**: `curl` the order endpoint with the URL but no cookie → `401`. ✅ G2
- **Post-checkout**: order → staff checkout → same phone re-order → `401` until fresh scan.
  ✅ G3
- **Bypass**: `POST /orders/` with body only → `401`. ✅
- **Happy path**: two phones at one table → both join same session, orders group into Rounds
  as today.
- Typecheck + `db:generate` diff review; no cross-origin cookie regressions (same-origin via
  proxy).

**Not touched:** staff/Better-Auth routes, QR generation/printing, order pricing/tax,
realtime channels (reused as-is).

---

## Key code references

- Crypto util (reuse for cookie): `apps/api/src/lib/crypto.ts` — AES-256-GCM, key from
  `ENCRYPTION_KEY`. Authenticated, so no separate signing secret needed.
- QR payload (root cause): `apps/api/src/routes/organization/table/table.logic.ts:299`.
- Token generation (never rotates): `table.logic.ts:278` (`generateQrToken`).
- Public decode endpoint: `table.route.ts:153` → `decodeQrToken` (`table.logic.ts:330`).
- Session middleware to mirror: `apps/api/src/middleware/session.ts` (Better Auth, staff-only).
- CORS (credentials:true, reflecting origin): `apps/api/src/middleware/cors.ts`.
- Context type to extend: `apps/api/src/index.ts:12-20` (`AppEnv.Variables`).
- Router mounts: `apps/api/src/app.ts`.
- Session create/reuse point: `orders.logic.ts:664-690` (`createOrAppend`, `FOR UPDATE` tx).
- Session active→completed transitions: `checkoutSession` (`orders.logic.ts:1180`),
  `releaseTableIfNeeded` (`orders.logic.ts:102`, reached from `update:788` / `updateStatus:836`).
- `table_session` schema: `apps/api/src/core/db/schemas/table.ts:43-80` (no
  `lastActivityAt`/`expiresAt`/`deviceId` yet).
- Migrations: `apps/api/drizzle.config.ts` → root `drizzle/`; scripts `db:generate` /
  `db:migrate` / `db:push` in `apps/api/package.json`.
- client-web token route: `apps/client-web/app/[token]/`, `modules/providers/table-provider.tsx`,
  `hooks/use-decode-token.ts`, `hooks/use-create-table-order.ts`, `lib/axios.ts`
  (`withCredentials: true`), `next.config.ts` (`/api/:path*` → `${API_URL}/v1/:path*` rewrite).
