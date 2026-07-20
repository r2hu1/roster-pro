# Secure QR Flow

Production-grade design for QR-based dine-in sessions. Replaces the current "anyone with the link can order forever" model with short-lived, revocable, server-side sessions while keeping printed QR codes permanent.

---

## 1. Current State & Vulnerabilities

### How it works today

1. Staff generates a QR token (`POST /organization/table/token`). Token = AES-256-GCM blob of `{ tableId, organizationId }`, stored in `table.qr_token`, reused forever.
2. Customer scans → lands on `client-web/app/[token]` → `GET /organization/table/token/decode` returns org + table info.
3. Customer places orders via `POST /organization/orders/table/:tableId` with `organizationId` in the body.

### Vulnerabilities (verified in code)

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| V1 | Critical | `POST /orders/table/:tableId` has **no auth of any kind** — not even the QR token. Anyone knowing `tableId` + `organizationId` can create orders from anywhere. | `apps/api/src/routes/organization/orders/orders.route.ts:93` |
| V2 | Critical | `tableId` and `organizationId` are public knowledge: the decode endpoint returns both, and the token is in the URL (shared links, browser history, screenshots). | `table.logic.ts:decodeQrToken` |
| V3 | High | `GET /orders/table/:tableId/active`, `GET /orders/:id`, `GET /orders/:orderId/invoice` are unauthenticated and trust `organizationId` from the query string — cross-org order/invoice reads. | `orders.route.ts:57,75,249` |
| V4 | High | QR token never expires and is never rotated. A leaked URL grants indefinite remote ordering. | `table.logic.ts:generateQrToken` |
| V5 | Medium | No rate limiting on customer endpoints — order spam / kitchen flooding is trivial. | all public routes |
| V6 | Medium | Customer cancel/modify use the static QR token as authorization — anyone at (or once at) the table can modify any order on that table, indefinitely. | `orders.logic.ts:cancelByCustomer/modifyByCustomer` |

### Core design flaw

The printed QR token is being used as both **identity** ("this is table 4 of org X" — fine, it must be static because it's printed) and **authorization** ("bearer may order" — broken, because it can never expire). The fix is to split those roles.

---

## 2. Target Architecture

```
┌──────────┐ native  ┌──────────────────────────────┐
│ Printed  │ camera  │ client-web /[qrToken]        │
│ QR (static│───────▶│  token scrubbed from history,│
│ identity) │        │  redirect to / (scanner)     │
└────┬─────┘         └──────────────┬───────────────┘
     │ in-app scanner               ▼
     │ (reads same QR)   ┌──────────────────────────────┐
     └──────────────────▶│ client-web /  (in-app scanner)│
                         │  parses token from QR content │
                         │  POST /public/qr/session      │
                         └──────────────┬───────────────┘
                                    │ issues
                                    ▼
                    ┌────────────────────────────────┐
                    │ QR Session (ephemeral authz)   │
                    │  opaque 256-bit token          │
                    │  Redis: qr:session:{sid}       │
                    │  TTL: 30min idle / 3h absolute │
                    │  bound to org + table +        │
                    │  tableSession                  │
                    └───────────────┬────────────────┘
                                    │ httpOnly cookie / bearer
                                    ▼
                    ┌────────────────────────────────┐
                    │ /public/* customer routes      │
                    │  qrSessionMiddleware derives   │
                    │  orgId + tableId from session, │
                    │  never from client input       │
                    └────────────────────────────────┘
```

**Principles**

1. **Static QR = identity only.** Scanning proves nothing except "someone has the URL". It grants exactly one capability: requesting a session.
2. **Session = authorization.** Short-lived, server-side (Redis), revocable, bound to one table + one active `tableSession`. All ordering requires it.
3. **Server derives scope.** `organizationId` / `tableId` come from the session record, never from request body or query params.
4. **Staff control the lifecycle.** Checkout, table close, or token regeneration instantly revokes every session on that table.
5. **Scanner-first entry.** The URL alone never grants a session — session issuance happens only after the in-app scanner reads the physical QR. Forwarded links are inert.

### 2.1 In-App Scanner Entry

`app/page.tsx` (currently a redirect stub) becomes the **scanner page** — the single entry point for starting a session:

1. Customer scans the printed QR with their **native camera** → browser opens `/{token}`.
2. `/[token]` does **not** exchange the token. It immediately scrubs the token from the address bar (`history.replaceState`) and, if no valid session credential exists, redirects to `/` showing: *"Point your camera at the table QR to start ordering."*
3. The in-app scanner (native `BarcodeDetector` API with a `@zxing/browser` or `jsQR` fallback) reads the same printed QR, parses the token out of the QR's URL content client-side, and calls `POST /public/qr/session` directly. The token never re-enters the address bar.
4. On success the credential is stored, and the customer lands on the menu at `/{token}` (token now acts purely as a route key; ordering authority is the session).
5. If a valid session already exists (cookie/credential verifies via `GET /public/qr/session`), both `/` and `/[token]` skip the scanner and go straight to the menu — no re-scan friction mid-meal.
6. On session expiry (401 `SESSION_EXPIRED`), the client returns to the scanner page — re-proof of physical presence is a camera scan, not a page refresh.

**What the scanner buys (and what it doesn't):**

- Forwarded/shared URLs become useless: the link contains no ordering authority and the landing page demands a physical scan. This kills the "WhatsApp the link to a friend at home" path for normal users.
- The token disappears from browser history, link previews, and screenshots of the address bar.
- Expiry re-scan turns TTL enforcement into genuine presence re-verification for legitimate users.
- **It is not a cryptographic boundary.** The server cannot distinguish a token read by the camera from a token pasted into the same `POST /public/qr/session` call — a motivated attacker who extracted the token once can still request sessions directly, and a *photo* of the printed QR scans as well as the original. The scanner reduces leak surface and adds friction; the session layer (TTLs, revocation, rate limits, staff activation) remains the actual enforcement. Do not weaken any server-side control on the assumption that "only the scanner can reach it."

Camera access requires a secure context (HTTPS — already the case) and user permission; the scanner page needs a graceful denied-permission fallback (manual "enter table code" assisted by staff, or a prompt to use the native camera path which redirects back with the token available for a one-tap "Start session" confirmation — still rate-limited and session-gated server-side).

---

## 3. Data Model

### 3.1 Redis (source of truth for live sessions)

Opaque token, not JWT — instant revocation matters more than statelessness here, and Redis (`core/redis/client.ts`) is already in the stack.

```
Key:   qr:session:{sessionId}
Value: {
  organizationId, tableId, tableNumber, tableSessionId,
  createdAt, lastActivityAt,
  ipHash, uaHash
}
TTL:   sliding 30min idle, hard cap 3h from createdAt

Key:   qr:table-sessions:{tableId}          (SET of sessionIds — bulk revocation index)
Key:   qr:issue-rate:{ipHash}               (rate-limit counter, TTL 60s)
Key:   qr:order-rate:{sessionId}            (rate-limit counter, TTL 60s)
```

The bearer credential given to the client is `{sessionId}.{secret}`, where `secret` is 32 random bytes (`crypto.randomBytes`); Redis stores `sha256(secret)` and validation is a constant-time compare. A Redis dump alone never leaks usable credentials.

### 3.2 Postgres

- Keep `table.qr_token` as the static identity token, but add `qr_token_version integer default 1` — bump on regeneration so old printed codes die (see 5.6).
- Reuse existing `tableSession` (already groups orders per seating). A QR session always attaches to the active `tableSession`, creating one if absent — same logic `createOrAppend` uses today.
- Optional (Phase 3): `qr_session_audit` append-only table for disputes/forensics (sessionId, tableId, orgId, createdAt, endedAt, endReason, orderCount).

### 3.3 Config per organization (Phase 3, `organization` table or settings JSON)

| Setting | Default | Purpose |
|---------|---------|---------|
| `qrSessionIdleTtlMin` | 30 | sliding expiry |
| `qrSessionMaxTtlMin` | 180 | absolute cap |
| `qrRequireStaffActivation` | false | table must be marked occupied before sessions issue |
| `qrMaxActiveSessionsPerTable` | 5 | concurrent devices per table |
| `qrMaxOrdersPerSession` | 20 | abuse cap |

---

## 4. API Changes

### 4.1 New public namespace

New router `apps/api/src/routes/public/qr/qr.route.ts` mounted at `/v1/public/qr`. Customer traffic moves out of `/organization/*` (which should eventually be staff-only).

```
POST /v1/public/qr/session            body: { qrToken }         → issues session
GET  /v1/public/qr/session            (auth: session)           → validates + returns org/table/menu context
DELETE /v1/public/qr/session          (auth: session)           → customer "leave table"

POST /v1/public/qr/orders             (auth: session)           → create/append order
GET  /v1/public/qr/orders/active      (auth: session)           → active orders for MY table only
GET  /v1/public/qr/orders/:orderId    (auth: session, ownership)→ order detail
PUT  /v1/public/qr/orders/:orderId    (auth: session, ownership)→ modify (pending only)
PATCH /v1/public/qr/orders/:orderId/cancel (auth: session, ownership)
GET  /v1/public/qr/orders/:orderId/invoice (auth: session, ownership)
GET  /v1/public/qr/stream             (auth: session)           → SSE scoped to session's table
```

Note the removal of `:tableId` and `organizationId` from every customer route — scope comes from the session.

### 4.2 Session issuance flow

`POST /public/qr/session`:

1. Rate limit by IP (e.g. 10/min) → 429.
2. Decrypt `qrToken` (existing `cryptoUtil.decrypt`), load table, verify `table.qrToken === qrToken` and `qr_token_version` matches → 401 on mismatch (regenerated/revoked).
3. Check table exists, org active, table status not blocked; if `qrRequireStaffActivation`, require table occupied → 403 with machine-readable reason code.
4. Enforce `qrMaxActiveSessionsPerTable` via the `qr:table-sessions` set (prune expired members first).
5. Find-or-create active `tableSession` for the table.
6. Create Redis session, add to table index, return context payload (org name/logo, table number, expiry) and set the credential.

**Credential transport:** `Set-Cookie: qr_session={sid}.{secret}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=10800`. Cookie keeps the credential out of localStorage (XSS) and out of URLs. Requires `client-web` to reach the API same-site (Next.js rewrite/proxy — `client-web` already proxies `/api/*`, see `use-active-orders-stream.ts`) or a correctly configured CORS + `credentials: include` setup. Fallback for the SSE/EventSource path if cross-origin: short-lived signed ticket minted from the session (`GET /public/qr/stream-ticket`) passed as a query param.

### 4.3 `qrSessionMiddleware`

New `apps/api/src/middleware/qr-session.ts`, mirroring `sessionMiddleware`'s shape:

1. Read credential from cookie (fallback `Authorization: Bearer`).
2. Parse `{sid}.{secret}`; fetch `qr:session:{sid}`; constant-time compare `sha256(secret)`.
3. Reject if missing/expired → 401 `{ code: "SESSION_EXPIRED" }` (client shows re-scan UI).
4. Enforce absolute TTL (`createdAt + maxTtl`) even if sliding TTL kept it alive.
5. Refresh sliding TTL, update `lastActivityAt`.
6. `c.set("qrSession", { sessionId, organizationId, tableId, tableSessionId, tableNumber })`.

### 4.4 Order logic changes (`orders.logic.ts`)

- `createOrAppend`: take `(qrSession, body)` — drop `organizationId` from the DTO; table/org come from session. Stamp `tableSessionId` from the session. Enforce `qrMaxOrdersPerSession` and per-session order rate limit.
- `cancelByCustomer` / `modifyByCustomer`: replace static-token check (`verifyTableToken`) with session + **ownership** check — the order's `tableSessionId` must equal the session's `tableSessionId` (only orders from the current seating are touchable, fixes V6).
- `getActiveByTableId`: session-scoped variant filters by `tableSessionId`, so a new party never sees the previous party's orders.
- Invoice: same ownership rule.

### 4.5 Kill the open endpoints (fixes V1, V3)

After client migration (Phase 4):

- Remove unauthenticated `POST /orders/table/:tableId`, `GET /orders/table/:tableId/active`, `GET /orders/:id`, `GET /orders/:orderId/invoice` from `orderRouter`, or wrap the remaining ones with `sessionMiddleware` for staff use.
- `GET /organization/table/token/decode` stays public (client-web metadata needs it) but response shrinks to branding only: org name/logo + table number. No IDs. IDs travel only inside sessions.

### 4.6 Session revocation triggers

Helper `revokeTableQrSessions(tableId)` — read `qr:table-sessions:{tableId}`, delete each `qr:session:*`, delete the set. Called from:

| Trigger | Location |
|---------|----------|
| Checkout (`checkoutSession`) — `tableSession` → completed | `orders.logic.ts` |
| Table deleted | `table.logic.ts:delete` |
| QR token regenerated (version bump) | `table.logic.ts` (new `regenerateQrToken`) |
| Staff "end session / clear table" action | new staff endpoint `POST /organization/table/:id/end-session` |

Publish `session.ended` on the existing realtime channel (`publishTableEvent`) so connected customer devices immediately show the "session ended" screen instead of failing on next request.

### 4.7 Rate limiting & abuse controls

- Issuance: per-IP counter (4.2).
- Ordering: per-session counter (e.g. 5 orders/min) + `qrMaxOrdersPerSession`.
- Optional order-value sanity cap per session for unattended abuse.
- Structured logs on 401/403/429 from public routes for monitoring.

---

## 5. Staff-side Changes (`apps/web`)

1. **`generateQrToken` stays** (prints stable QR). Add explicit **"Regenerate QR"** action in `table-qr-code.tsx` modal → new `POST /organization/table/token/regenerate` → new token + version bump + `revokeTableQrSessions`. UI warns printed codes must be replaced.
2. **Session visibility** on tables view: active QR session count per table (from Redis index), "End session" button.
3. Checkout flow unchanged — revocation hooks in automatically (4.6).

---

## 6. Customer-side Changes (`apps/client-web`)

1. **Scanner page** (`app/page.tsx`): replace the redirect stub with the in-app scanner (2.1). Components: camera viewfinder (`BarcodeDetector` + `@zxing/browser`/`jsQR` fallback), permission-denied fallback, "already have a session" fast path via `GET /public/qr/session`. Drop the `last-visited` localStorage auto-redirect — auto-resuming a stale table URL bypasses the presence check.
2. **`app/[token]`**: never auto-exchanges. Scrub token from the URL bar, redirect to `/` scanner when no valid session; render menu when a session exists. Layout metadata keeps using the branding-only decode endpoint.
3. **`TableProvider`** (`modules/providers/table-provider.tsx`): context now sourced from the session issuance response (org/table payload) instead of `useDecodeToken`. On 401 → scanner page; on 403 show reason ("Ask staff to open the table").
4. **Axios instance** (`lib/axios.ts`): attach the session credential; 401 `SESSION_EXPIRED` interceptor → clear credential, route to scanner page.
5. **Hooks** (`use-create-table-order`, `use-active-orders`, `use-cancel-table-order`, `use-modify-table-order`, `use-order`): point at `/public/qr/orders/*`; drop `tableId`/`organizationId` params — cart flow (`responsive-placing-order.tsx`) no longer sends `organizationId`.
6. **SSE** (`use-active-orders-stream.ts` / `realtime-server.ts`): connect to `/public/qr/stream` with cookie (or stream ticket, 4.2); handle `session.ended` → session-ended screen.
7. **Session-expiry UX**: full-screen scanner prompt, not a toast — customer must physically rescan. Cart persists in localStorage across re-issue so nothing is lost.

---

## 7. Security Properties After Implementation

| Threat | Mitigation |
|--------|-----------|
| Shared/leaked URL used remotely later | URL alone grants nothing: landing page demands an in-app camera scan of the physical QR before a session is issued. Even with the token extracted, sessions expire (30min idle / 3h hard), die at checkout, and issuance is rate-limited + staff-activation-gated |
| Link forwarded to someone off-premise | Scanner-first entry — the link contains no ordering authority; recipient needs the physical QR (or a photo of it — see residual risks) |
| Order forgery with known tableId/orgId (V1) | Open endpoints removed; scope derived server-side from session |
| Cross-org data reads (V3) | All customer reads session-scoped; decode returns branding only |
| Previous party reads/modifies current party's orders (V6) | Ownership = matching `tableSessionId` |
| Order spam / kitchen flooding (V5) | IP + session rate limits, per-session order caps, concurrent-session cap |
| Stolen session credential | HttpOnly cookie (no JS access); Redis-side secret hashed; short TTL; revocable |
| Compromised printed QR | Regenerate + version bump kills it instantly |

Residual (accepted or Phase-3+): a person physically at the table can order — that is the product; someone scanning then walking out can order until idle timeout — bounded by TTL, activation mode, and staff visibility. A **photo of the printed QR** scans identically to the original, and a motivated attacker can call the session endpoint with an extracted token directly — the scanner is friction, not proof; server-side controls carry the enforcement. True presence-proof (rotating TOTP QR on a table display, BLE/geofence) is possible later; incompatible with printed codes, so out of scope for the base design.

---

## 8. Implementation Phases

**Phase 1 — Backend foundation** (no breaking changes)
- Redis session store + credential scheme, `qrSessionMiddleware`, `POST/GET/DELETE /public/qr/session`, issuance rate limiting, `qr_token_version` migration, `revokeTableQrSessions` + checkout/delete/regenerate hooks.

**Phase 2 — Public order routes**
- `/public/qr/orders/*` + session-scoped logic variants (create/active/detail/modify/cancel/invoice), per-session rate limits, SSE via session. Old routes still up.

**Phase 3 — Client migration**
- `client-web` switches to scanner-first session flow (2.1, 6.1–6.7): scanner page at `/`, `[token]` redirect behavior, session-backed hooks; staff UI regenerate + session visibility (5.1–5.2); org-level config knobs.

**Phase 4 — Lockdown**
- Remove/staff-gate legacy open endpoints (4.5), slim decode response, deploy monitoring on public-route 4xx.

Each phase ships independently; rollback = client points back at legacy routes until Phase 4.

---

## 9. Testing Checklist

- Session issuance: valid token, tampered token, regenerated (stale version) token, disabled table, rate-limit trip, max-sessions trip.
- Middleware: missing/malformed/expired credential, wrong secret (constant-time path), idle-TTL refresh, absolute-TTL cutoff despite activity.
- Ordering: order without session → 401; order with expired session → 401; modify order from previous `tableSession` → 403; cross-table order attempt via forged IDs → impossible (no ID inputs).
- Revocation: checkout kills all table sessions mid-flight; regenerate kills sessions and old printed QR; `session.ended` reaches connected SSE clients.
- Scanner entry: `/[token]` visit scrubs token from history and redirects to scanner when sessionless; valid session skips the scanner on both `/` and `/[token]`; scanner parses token from QR URL content; camera-permission-denied fallback works; expiry mid-meal returns to scanner and cart survives re-issue.
- Load: issuance and order rate limits under burst; Redis TTL cleanup leaves no orphaned index members.
