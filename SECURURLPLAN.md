# Plan: Stateless, zero-DB-hot-path table sessions for QR ordering (production grade)

## Problem with current plan at scale

The previous approach requires **DB read + write on every gated request**: lookup session by sid, check `status = active`, verify timestamps, touch `lastActivityAt`. At 100k+ users with polling (active order, menu), that's 1M+ DB ops/day.

Also: QR token never rotates — static bearer credential forever.

## Approach: Self-validating encrypted cookie + lazy-DB

Cookie carries all claims needed for validation. Middleware **never touches DB on the hot path**. DB only for session creation, completion, and background batch writes. Redis holds a small denylist for immediate invalidation.

### How it works

```
QR scan → server INSERTs session row, encrypts claims into HttpOnly cookie
             ↓
Every request → middleware decrypts cookie, checks timestamps (no DB, no Redis on the
                common path — denylist is a probabilistic-fast local check, see below)
             ↓
Activity → rolling cookie reissue (throttled) + debounced batch DB write
             ↓
Checkout → DB sets status=completed + denylist entry (Redis) + local cache broadcast
```

## Scalability properties

| Concern | Current plan | This plan |
|---------|-------------|-----------|
| DB reads/request | 1 (session lookup) | 0 (crypto only) |
| DB writes/request | 1 (touch lastActivityAt) | 0 (batched, ≤1 write / 5s / instance) |
| Session validation | `SELECT ... WHERE id = ?` | AES-GCM decrypt + clock check |
| Horizontal scale | Needs shared session store | Stateless — any instance validates; Redis only for denylist |
| Invalidation latency | Immediate | ≤ ~100ms (Redis) |

## Cookie spec

**Name:** `__Host-rp_ts` in production (`__Host-` prefix enforces `Secure`, `Path=/`, no `Domain` at the browser level — hardens against cookie tossing from subdomains). Plain `rp_ts` in dev over http.

**Encryption:** AES-256-GCM via existing `cryptoUtil` (`apps/api/src/lib/crypto.ts`), extended for key versioning:

- 12-byte random nonce per encryption (never reuse; random is fine at this volume).
- **AAD** = `"rp_ts.v1"` — binds ciphertext to this cookie's purpose and version so a ciphertext minted for another feature using the same key can never validate here.
- **Key versioning:** wire format `v1.<kid>.<base64url(nonce|ciphertext|tag)>`. Keys come from `TABLE_SESSION_KEYS` (JSON map `kid → key`), `TABLE_SESSION_ACTIVE_KID` selects the encryption key. Decrypt accepts any listed kid. This makes key rotation a config change: add new key, flip active kid, drop old key after `ABSOLUTE_CAP` elapses. Do **not** reuse the global `ENCRYPTION_KEY` — a leak or rotation of one must not force the other.
- Reject before decrypt: cookie longer than 1 KB, unknown version, unknown kid. Cheap DoS guard ahead of crypto work.

**Payload:**

```ts
{
  v: 1;                   // payload schema version (forward compat)
  sid: string;            // uuid — DB cross-ref (checkout, audit, denylist key)
  tid: string;            // tableId
  oid: string;            // organizationId
  did: string;            // deviceId — random at scan time (not a fingerprint)
  iat: number;            // issued at (ms)
  laa: number;            // lastActivityAt (ms) — refreshed on rolling reissue
  exp: number;            // absolute cap (ms) — fixed at session creation, never extended
}
```

Short keys keep the cookie ~250 bytes after encryption + base64url — well under header-size trouble.

**Attributes:** `HttpOnly`, `SameSite=Lax`, `Secure` (prod), `Path=/`, no `Domain`, `Max-Age = ABSOLUTE_CAP`.

**CSRF note:** `SameSite=Lax` blocks cross-site POSTs in modern browsers. The gated surface is same-site XHR with `withCredentials` from client-web only; CORS already restricts origins (`apps/api/src/middleware/cors.ts`). No separate CSRF token needed — document this as the explicit decision.

## Middleware validation flow (zero DB)

```
Request → read cookie → structural checks (size/version/kid) → decrypt (AAD-bound) → validate:
  1. payload.v === 1
  2. now < exp + SKEW                      (absolute cap)
  3. now < laa + IDLE_WINDOW + SKEW        (idle timeout)
  4. tid matches route param
  5. oid matches route param/body
  6. denylist check (see below)

On invalid → 401 { code: "TABLE_SESSION_INVALID" }  (single opaque code — no oracle
             distinguishing "expired" vs "bad ciphertext" vs "revoked" to callers;
             log the precise reason server-side)
On valid   → c.set("tableSession", payload) → touchSession(sid) → maybeReissue() → proceed
```

`SKEW = 30s` clock-skew leeway. Instances must run NTP; leeway covers the rest.

### Rolling reissue (the part the old plan got wrong)

The cookie is the authority for `laa`, but a cookie can't be mutated server-side without a `Set-Cookie`. So idle-window enforcement requires **reissuing the cookie as activity happens**:

- On each valid request, if `now - laa > REISSUE_INTERVAL` (60s), re-encrypt the payload with `laa = now` and `Set-Cookie` on the response. Same `sid`, same `exp` — **absolute cap never extends**.
- Throttling to 60s means at most 1 reissue/min/device instead of one per response, and worst-case idle-window slack is `IDLE_WINDOW + 60s`. Fine at restaurant granularity.
- Reissue is response-side only — adds one AES encrypt, no I/O.

Without this, `laa` in the cookie is frozen at scan time and every session dies exactly `IDLE_WINDOW` after scan regardless of activity.

## DB + Redis interaction

### When we still touch DB

1. **Session create** (QR scan): INSERT row `status=active`, `expiresAt=exp`, return `sid`.
2. **Session complete** (checkout/close): UPDATE `status=completed` + denylist write.
3. **Activity batch write** (background): batched `lastActivityAt` UPDATE, ≤1 statement per 5s per instance.

### Denylist (immediate invalidation, G3)

Two tiers:

- **Tier 1 — per-instance in-memory set** of denied sids, populated via Redis pub/sub (`ts-invalid` channel) and checked on every request. O(1), no network. Entries expire at their session's `exp`.
- **Tier 2 — Redis** `SET ts-invalid:{sid} 1 EX <exp - now>`, written at checkout alongside the DB update. Source of truth for instances that boot after the pub/sub message (on startup, an instance may serve a stale-allow until Tier 3 catches it — acceptable, see failure modes).
- **Tier 3 — DB fallback:** only consulted when Redis is unavailable (circuit breaker open) — `SELECT status WHERE id = ?`, capped by a rate limiter so a Redis outage can't stampede the DB.

Hot path in the normal case touches **neither Redis nor DB** — the local set answers. Redis round-trips happen only on checkout and via pub/sub push.

**Failure modes (decide explicitly, don't discover in an incident):**

| Failure | Behavior | Rationale |
|---------|----------|-----------|
| Redis down | Fail-open on denylist (cookie timestamps still enforced), Tier 3 DB check behind circuit breaker + rate limit | Worst case: a checked-out session orders again for minutes. Restaurant risk ≈ zero; blocking all ordering is the worse outcome |
| Redis + DB down | 503 on session create; existing cookies keep working within their windows | Statelessness pays off exactly here |
| Instance restart | Local denylist empty; repopulated lazily from Redis on first miss per sid | Bounded staleness, self-heals |

Redis is **required in production** (multi-instance is a given at 100k users). The in-memory-only mode exists for local dev, selected by config, never by silent fallback.

## Activity batching

`lastActivityAt` in the DB is analytics/audit data, not an enforcement input (the cookie enforces). So batching is safe:

```ts
const activityQueue = new Map<string, number>() // sid → max observed ts
let flushTimer: NodeJS.Timeout | null = null

function touchSession(sid: string) {
  activityQueue.set(sid, Date.now())
  if (activityQueue.size >= MAX_BATCH) return void flushActivityBatch()
  if (!flushTimer) flushTimer = setTimeout(flushActivityBatch, FLUSH_INTERVAL_MS)
}

async function flushActivityBatch() {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
  if (activityQueue.size === 0) return
  const batch = [...activityQueue.entries()]
  activityQueue.clear()
  try {
    // Postgres batch form: UPDATE ... FROM (SELECT unnest($ids), unnest($ts)) v
    // SET last_activity_at = GREATEST(last_activity_at, v.ts) WHERE id = v.id
    await db.execute(batchUpdateActivity(batch))
  } catch (err) {
    for (const [sid, ts] of batch)                    // re-queue on failure, keep max
      activityQueue.set(sid, Math.max(ts, activityQueue.get(sid) ?? 0))
    logger.error({ err, size: batch.length }, "activity flush failed")
  }
}
```

- `FLUSH_INTERVAL_MS = 5000`, `MAX_BATCH = 500`. Note: **`setTimeout`, not `setImmediate`** — `setImmediate` fires on the next tick and defeats batching entirely (the old draft had this bug).
- `GREATEST` guard makes flushes idempotent and safe against out-of-order flushes across instances. The `VALUES()` syntax in the old draft was MySQL; this repo is Postgres/Drizzle — use the `unnest` form.
- **Graceful shutdown:** SIGTERM handler awaits a final flush (with timeout) before exit. Losing ≤5s of activity data on a crash is acceptable; losing it on every deploy is not.
- Cap: if the queue somehow exceeds 10× MAX_BATCH (DB down), drop oldest entries and count them in a metric. Activity data is droppable; memory is not.

## Windows (configurable via shared constants)

`IDLE_WINDOW = 45 min`, `ABSOLUTE_CAP = 4 h`, `REISSUE_INTERVAL = 60 s`, `SKEW = 30 s`.

## QR token rotation (closes the "static bearer forever" hole)

Add `qrVersion int default 1` to the table schema and embed it in the QR payload. `decodeQrToken` rejects mismatched versions. Staff UI gets a "regenerate QR" action that bumps the version — reprint the card, old photos of it die instantly. No expiry on the QR itself (printed media), rotation-on-demand is the right primitive.

Rate-limit the public decode endpoint (`table.route.ts:153`) per IP — it's unauthenticated by design and mints sessions.

## Guarantees

- **G1 Time-box:** enforced cryptographically in middleware (exp + idle via rolling reissue). No DB.
- **G2 Device-bind:** `HttpOnly` encrypted cookie with random `did`. Raw URL alone cannot produce a valid cookie; the ciphertext is AAD-bound and non-forgeable without the key.
- **G3 Lifecycle kill:** checkout → DB write + Redis denylist + pub/sub broadcast. Kill latency ≈ pub/sub propagation (~ms) on warm instances, one Redis GET on cold ones.
- **G4 Visibility:** session create → `occupied` flag + realtime event, as before.

## Observability (required before launch, not after)

Metrics (counter/histogram via existing metrics setup, or add one):

- `table_session.decrypt_fail` by reason (bad_kid, bad_tag, oversize) — spike = attack or key-rotation mistake
- `table_session.rejected` by reason (expired, idle, denylisted, tid_mismatch)
- `table_session.reissue` rate — sanity-check throttling works
- `table_session.activity_flush` size + duration + failures
- `table_session.denylist_redis_fallback` and `db_fallback` — nonzero sustained = Redis trouble
- Alert: decrypt_fail rate > 1% of gated traffic; db_fallback > 0 for 5 min.

Log every 401 with the precise internal reason + sid (when decryptable) — the client only ever sees `TABLE_SESSION_INVALID`.

## Trade-offs vs current plan

| Item | Current plan | This plan |
|------|-------------|-----------|
| DB load | O(requests) | O(sessions) |
| Invalidation precision | Immediate (DB check) | ~ms (pub/sub) to ~100ms (Redis GET) |
| lastActivityAt precision | Per-request | ≤5s stale in DB; ≤60s granularity in cookie |
| Infra | none | Redis (already justified for multi-instance anyway) |
| Complexity | Moderate | Moderate + reissue/batch/denylist (~400 lines) |

Idle-window slack of up to `REISSUE_INTERVAL` and 5s activity staleness are invisible at restaurant UX granularity.

## Changes

### 1. Schema — `apps/api/src/core/db/schemas/table.ts`

Add to `tableSession`: `lastActivityAt timestamp`, `expiresAt timestamp`. Add to `table`: `qrVersion integer notNull default 1`.

### 2. Cookie util — `apps/api/src/lib/table-session-cookie.ts` (new)

Encode/decode `SessionPayload` with AES-256-GCM: versioned wire format, kid map from `TABLE_SESSION_KEYS` / `TABLE_SESSION_ACTIVE_KID`, AAD `"rp_ts.v1"`, size/version pre-checks. Pure functions, no I/O — unit-test round-trip, tamper, wrong-kid, oversize, expired-key rotation.

### 3. Denylist — `apps/api/src/lib/session-denylist.ts` (new)

Local `Set` + Redis (`ioredis`) + pub/sub subscriber + circuit breaker + rate-limited DB fallback. Config flag selects `memory` (dev) | `redis` (prod). Expose `deny(sid, ttl)`, `isDenied(sid)`.

### 4. Middleware — `apps/api/src/middleware/table-session.ts` (new)

Order: structural checks → decrypt → timestamp/route validation → denylist → `c.set("tableSession", payload)` → `touchSession(sid)` → throttled reissue on response. Mirror shape of `apps/api/src/middleware/session.ts`.

### 5. Activity batcher — `apps/api/src/lib/activity-batch.ts` (new)

As specified above, incl. SIGTERM flush hook registered in `apps/api/src/index.ts`.

### 6. `decodeQrToken` becomes session issuer — `table.route.ts` + `table.logic.ts`

Validate QR (incl. `qrVersion`) → lazy-expire past-cap sessions → create/join (existing `FOR UPDATE` tx pattern from `orders.logic.ts:664-690`) → encrypt cookie → `setCookie`. Add per-IP rate limit.

### 7. Apply gate (same routes as before)

- `orders.route.ts`: POST /table/:tableId, POST /, GET /table/:tableId/active, GET /:id, GET /:orderId/invoice
- `menu.route.ts`: GET /all/:organizationId
- `createOrAppend` (`orders.logic.ts:558`): use middleware-provided `sid` (append); activity via batcher.
- `checkoutSession` (`orders.logic.ts:1180`) / `releaseTableIfNeeded` (`orders.logic.ts:102`): add `deny(sid, remainingTtl)` call.

### 8. client-web

- Remove `last-visited` auto-reopen (`table-provider.tsx:22-24`, `app/page.tsx`)
- "Session ended — rescan at your table" gate screen on `TABLE_SESSION_INVALID` (single code, no reason branching client-side)
- Confirm `withCredentials: true` (already set)

### 9. Shared — `packages/shared`

`IDLE_WINDOW`, `ABSOLUTE_CAP`, `REISSUE_INTERVAL`, `TABLE_SESSION_INVALID` error code.

### 10. Config / env

`TABLE_SESSION_KEYS`, `TABLE_SESSION_ACTIVE_KID`, `REDIS_URL`, `TABLE_SESSION_DENYLIST=memory|redis`. Fail fast at boot if prod + `memory`, or if active kid missing from key map.

## Verification

Functional:

- **Reuse-later**: scan → order OK → wait past idle window → order/menu `401`, gate shows. ✅ G1
- **Rolling reissue**: stay active past original `IDLE_WINDOW` from scan time → still works (old plan would have failed here); verify `Set-Cookie` appears ≤1/min.
- **Absolute cap**: continuous activity past `ABSOLUTE_CAP` → `401`. Cap never extends.
- **Raw-URL replay**: `curl` order endpoint with URL, no cookie → `401`. ✅ G2
- **Tamper**: flip one byte of cookie → `401`, `decrypt_fail` metric increments, client sees generic code.
- **Post-checkout**: order → checkout → same phone re-order → `401` instantly on same instance and (multi-instance test) on the other instance via pub/sub. ✅ G3
- **QR rotation**: bump `qrVersion` → old QR URL rejected, new one works.

Operational:

- **Key rotation drill**: add key `k2`, flip active kid, verify old cookies (k1) still decrypt; remove k1 → old cookies `401`.
- **Redis kill**: stop Redis mid-traffic → ordering continues (fail-open), `db_fallback` metric rises, no error spike; restart → drains.
- **Deploy flush**: SIGTERM under load → final activity batch lands, no lost > 5s.
- **Load test**: k6, target ≥2k rps mixed (menu poll + order) on one instance — hot path is one AES decrypt, expect CPU-bound headroom; record p99.
- Typecheck + `db:generate` diff review.

**Not touched:** staff/Better-Auth routes, QR generation/printing internals, order pricing/tax, realtime channels.

## Key code references

- Crypto util: `apps/api/src/lib/crypto.ts` — AES-256-GCM (extend with kid support; keep `ENCRYPTION_KEY` uses untouched)
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
