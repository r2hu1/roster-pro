# Plan: Stateless, zero-DB-hot-path table sessions for QR ordering at 100k+ users

## Problem with current plan at scale

The previous approach requires **DB read + write on every gated request**: lookup session by sid, check `status = active`, verify timestamps, touch `lastActivityAt`. At 100k+ users with polling (active order, menu), that's 1M+ DB ops/day.

Also: QR token never rotates — static bearer credential forever.

## Approach: Self-validating encrypted cookie + lazy-DB

Cookie carries all claims needed for validation. Middleware **never touches DB on hot path**. DB only for session creation, completion, and background writes.

### How it works

```
QR scan → server encrypts { sid, tableId, orgId, deviceId, iat, lastActivityAt, exp } into HttpOnly cookie
             ↓
Every request → middleware decrypts cookie, checks timestamps (no DB)
             ↓
Background: batch-write lastActivityAt every N min
             ↓
Checkout → DB sets status=completed + push to cache invalidation
```

## Scalability properties

| Concern | Current plan | This plan |
|---------|-------------|-----------|
| DB reads/request | 1 (session lookup) | 0 (crypto only) |
| DB writes/request | 1 (touch lastActivityAt) | 0 (batch async) |
| Session validation | SELECT ... WHERE id = ? | AES-GCM decrypt + clock check |
| Horizontal scale | Needs shared session store | Stateless — any instance works |
| Cookie size | ~200 bytes | ~200 bytes (same) |

## Cookie spec

**Name:** `rp_ts`
**Encryption:** AES-256-GCM (existing `cryptoUtil`), key from `ENCRYPTION_KEY`
**Payload:**

```ts
{
  sid: string;            // uuid — for DB cross-ref only (checkout, audit)
  tableId: string;
  organizationId: string;
  deviceId: string;       // random at scan time (not device fingerprint)
  iat: number;            // issued at (ms)
  lastActivityAt: number; // ms, updated on batch writes
  exp: number;            // absolute cap (ms)
}
```

**Attributes:** `HttpOnly`, `SameSite=Lax`, `Secure` in prod, `Path=/`, no `Domain`.

## Middleware validation flow (zero DB)

```
Request → read cookie → decrypt → validate:
  1. now < exp (absolute cap)
  2. now < lastActivityAt + IDLE_WINDOW
  3. tableId matches route param
  4. orgId matches route param/body

On invalid → 401 { code: "TABLE_SESSION_INVALID" }
On valid → c.set("tableSession", payload) → proceed
```

**No DB read.** The cookie is authority.

## DB interaction (3 total, not per request)

### When we still touch DB

1. **Session create** (on QR scan): INSERT row with `status=active`, `expiresAt=exp`, remember `sid`.
2. **Session complete** (checkout/close): UPDATE `status=completed` + publish to cache invalidation.
3. **Activity batch write** (background): UPDATE `lastActivityAt` every N seconds (debounced per sid).

### Fast invalidation cache (completed sessions)

Checkout sets `cache.set(`ts-invalid:${sid}`, true, TTL=ABSOLUTE_CAP)`. Middleware checks:

```
if cache.get(`ts-invalid:${sid}`) → 401
if DB fallback (cache miss) → SELECT status WHERE id = ?
```

In-memory LRU single-box. Redis if multi-box.

This removes the 1:1 request:DB dependency while keeping G3 (post-checkout kill).

## Activity batching

`lastActivityAt` written via debounced batch:

```ts
const activityQueue = new Map<string, number>()  // sid → timestamp
let flushTimer: NodeJS.Timeout

function touchSession(sid: string) {
  activityQueue.set(sid, Date.now())
  if (!flushTimer) flushTimer = setImmediate(flushActivityBatch)
}

async function flushActivityBatch() {
  const batch = [...activityQueue.entries()]
  activityQueue.clear()
  flushTimer = null
  if (batch.length === 0) return
  await db.update(tableSession)
    .set({ lastActivityAt: sql`GREATEST(lastActivityAt, VALUES(lastActivityAt))` })
    .where(inArray(tableSession.id, batch.map(([id]) => id)))
}
```

Flush every 5s or every 100 queued writes. This turns N writes/request into 1 write per 5s per instance.

## Windows (configurable)

`IDLE_WINDOW = 45 min`, `ABSOLUTE_CAP = 4 h`.

## Guarantees

- **G1 Time-box:** enforced cryptographically in middleware. No DB needed.
- **G2 Device-bind:** `HttpOnly` cookie with random `deviceId` embed. Raw URL alone cannot decrypt.
- **G3 Lifecycle kill:** checkout → cache invalidation + DB write. Worst-case window = cache write propagation (~50ms) or DB poll interval if cache miss.
- **G4 Visibility:** session create → `occupied` flag + realtime event, as before.

## Trade-offs vs current plan

| Item | Current plan | This plan |
|------|-------------|-----------|
| DB load | O(requests) | O(sessions) |
| Session invalidation precision | Immediate (DB check) | ~50ms (cache) |
| lastActivityAt precision | Per-request | Per-batch (≤5s stale) |
| Complexity | Moderate | Moderate + batch/cache |
| Code footprint | ~200 lines | ~350 lines |

The 5s staleness on activity means a session might survive up to 5s past the idle timeout. Acceptable for a restaurant app — the UX difference between "your order went through" and "session expired" is negligible at that granularity.

## Changes

### 1. Schema — `apps/api/src/core/db/schemas/table.ts`

Same as before: add `lastActivityAt timestamp` and `expiresAt timestamp` to `tableSession`. But `lastActivityAt` is now updated in batch, not per-request.

### 2. Cookie util — `apps/api/src/lib/table-session-cookie.ts`

Encode/decode `SessionPayload` with AES-256-GCM. No DB lookup. Constants for IDLE_WINDOW, ABSOLUTE_CAP.

### 3. Middleware — `apps/api/src/middleware/table-session.ts`

Decrypt cookie → timestamps check → cache invalidation check → `c.set("tableSession", payload)` → pass.
Cache miss → fallback DB query (rare — only after restart or cache eviction).
On pass → enqueue `touchSession(sid)` (debounced batch, not immediate DB write).

### 4. `decodeQrToken` becomes session issuer — `table.route.ts` + `table.logic.ts`

Same flow as before: validate QR → lazy-expire past-cap sessions → create/join → encrypt cookie → `setCookie`.

### 5. Cache setup — `apps/api/src/lib/cache.ts` (new)

Abstract over in-memory Map or Redis. Single interface:

```ts
interface Cache {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string, ttlSeconds: number): Promise<void>
  del(key: string): Promise<void>
}
```

Start with in-memory LRU (no infra). Swap to Redis by changing import when scaling across multiple API instances.

### 6. Apply gate (same routes as before)

- `orders.route.ts`: POST /table/:tableId, POST /, GET /table/:tableId/active, GET /:id, GET /:orderId/invoice
- `menu.route.ts`: GET /all/:organizationId
- `createOrAppend` (`orders.logic.ts:558`): use middleware-provided `sid` (append), stamp `lastActivityAt` via batch.

### 7. client-web

- Remove `last-visited` auto-reopen (`table-provider.tsx:22-24`, `app/page.tsx`)
- Add "session ended — rescan at your table" gate screen on `TABLE_SESSION_INVALID`
- Confirm `withCredentials: true` (already set)

### 8. Shared — `packages/shared`

Add `IDLE_WINDOW`, `ABSOLUTE_CAP`, `TABLE_SESSION_INVALID` error code.

## Verification

- **Reuse-later**: scan → order OK → wait past window → order/menu `401`, gate shows. ✅ G1
- **Raw-URL replay**: `curl` order endpoint with URL, no cookie → `401`. ✅ G2
- **Post-checkout**: order → checkout → same phone re-order → `401` until fresh scan. ✅ G3
- **Cache layer**: after checkout, verify cookie immediately fails (cache hit). Restart API server → verify DB fallback works.
- **Batch activity**: verify `lastActivityAt` updates in DB every ~5s during active use, not per request.
- **Happy path**: two phones at same table → both join one session, orders group into Rounds as today.
- Typecheck + `db:generate` diff review.

**Not touched:** staff/Better-Auth routes, QR generation/printing, order pricing/tax, realtime channels.

## Key code references

- Crypto util: `apps/api/src/lib/crypto.ts` — AES-256-GCM, key from `ENCRYPTION_KEY`
- QR payload: `apps/api/src/routes/organization/table/table.logic.ts:299`
- Public decode endpoint: `table.route.ts:153` → `decodeQrToken` (`table.logic.ts:330`)
- Session middleware to mirror: `apps/api/src/middleware/session.ts`
- CORS: `apps/api/src/middleware/cors.ts`
- Context type to extend: `apps/api/src/index.ts:12-20` (`AppEnv.Variables`)
- Router mounts: `apps/api/src/app.ts`
- Session create/reuse: `orders.logic.ts:664-690` (`createOrAppend`, `FOR UPDATE` tx)
- Session complete: `checkoutSession` (`orders.logic.ts:1180`), `releaseTableIfNeeded` (`orders.logic.ts:102`)
- `table_session` schema: `apps/api/src/core/db/schemas/table.ts:43-80`
- Migrations: `apps/api/drizzle.config.ts` → root `drizzle/`
- client-web: `apps/client-web/app/[token]/`, `modules/providers/table-provider.tsx`, `hooks/use-decode-token.ts`, `hooks/use-create-table-order.ts`, `lib/axios.ts`, `next.config.ts`
