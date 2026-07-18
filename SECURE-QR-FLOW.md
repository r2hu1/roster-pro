# Secure QR Session Flow

## Problem

Current QR flow has zero access control:
- Static encrypted token `{tableId, orgId}` embedded in URL
- Token never expires, never rotates
- No device binding — anyone with URL can order from anywhere
- No session concept — token IS auth
- No rate limiting on decode endpoint
- One `table.qrToken` shared by all customers scanning same table

## Constraints

Must handle this real scenario: **4 people at same table, each scans QR from own phone → each browses menu, places separate orders → all orders visible to all**. QR token is an "invitation code", not a single-use ticket.

| Valid use case | Must work |
|----------------|-----------|
| Multiple phones, same table, separate orders | Yes |
| Person leaves, friend joins, scans same QR | Yes |
| Single phone browses + orders + tracks status | Yes |
| **QR photographed, shared on Twitter, 1000 off-site scans** | **Must block** |

The constraint pair (multi-user-at-table vs prevent-off-site-abuse) requires **per-session device binding + ephemeral TTL**, not token consumption.

## Physical Reality: Printed QR

QR codes are **printed on table cards / menu stickers**. They cannot be rotated, regenerated, or consumed. The `table.qrToken` value is a permanent fixture for the table's lifetime.

Implications:
- `table.qrToken` is a static table identifier, not a revocable credential
- `table.qrToken === token` check always passes — remove it as a security gate
- No QR rotation, no token consumption, no "clear qrToken column"
- **Geofence is the primary off-site abuse defense, not an optional phase**
- If a printed QR is compromised (photo shared online), the defense is: geofence + device binding + rate limiting. Cannot "revoke" the printed card without reprinting.

## Architecture

Two-layer auth:
- **Layer 1 — QR Token**: existing AES-256-GCM encrypted token. Reusable "invitation code". NOT consumed on first scan.
- **Layer 2 — QR Session**: short-lived server-side session created per scan. Device-bound, TTL-gated, rate-limited.

### Data Flow

```
┌─ Dashboard ──────────────────────────┐
│ POST /table/token  [sessionMiddleware]│
│ → encrypt({tableId, orgId})          │
│ → store in table.qrToken             │
│ → return { token }                   │
└──────────────┬───────────────────────┘
               │ QR encodes: order.rosterpro.in/{token}
               ▼
┌─ Customer ───────────────────────────┐
│ Browser GET /{token}                 │
│ → layout.tsx decodes token (existing)│
│ → CLIENT: POST /table/token/session  │
│   { token, deviceFingerprint }       │
│ → Returns { sessionToken, expiresAt }│
│ → Store sessionToken in memory/httpOnly cookie
│ → All subsequent API calls include   │
│   X-Session-Token header             │
└───────────────────┬──────────────────┘
                    │
┌─ API Server ──────┴──────────────────┐
│ qrSessionMiddleware:                  │
│ 1. Extract sessionToken from header  │
│ 2. Lookup in Redis (hot) → fallback  │
│    DB (cold)                          │
│ 3. Check status='active', expires_at │
│ 4. Verify device fingerprint (opt)   │
│ 5. Update last_activity_at           │
│ 6. Extend Redis TTL                  │
│                                      │
│ POST /order/table/{id}  [qrSession]  │
│ → Reads qrSession from context       │
│ → Uses session.orgId + tableId       │
│ → Create order (same as today)       │
└──────────────────────────────────────┘
```

## New Table: `qr_session`

```sql
CREATE TABLE qr_session (
  id             TEXT PRIMARY KEY DEFAULT uuidv4(),
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  table_id       TEXT NOT NULL REFERENCES "table"(id) ON DELETE CASCADE,
  qr_token_hash  TEXT NOT NULL,
  session_token  TEXT NOT NULL UNIQUE,
  device_fingerprint TEXT,
  ip_address     TEXT,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','expired','revoked')),
  last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMP NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX qr_session_org_idx ON qr_session(organization_id);
CREATE INDEX qr_session_table_idx ON qr_session(table_id);
CREATE INDEX qr_session_token_idx ON qr_session(session_token);
CREATE INDEX qr_session_hash_idx ON qr_session(qr_token_hash);
CREATE INDEX qr_session_status_expires ON qr_session(status, expires_at);
```

`schema.ts` location: `apps/api/src/core/db/schemas/table.ts` (alongside existing `tableSession`)

## Redis Key Schema

| Key | Value | TTL |
|-----|-------|-----|
| `qr_session:{sessionToken}` | `{ organizationId, tableId, status, expiresAt, deviceFingerprint }` | Session remaining TTL |
| `qr_rate_limit:{endpoint}:{fingerprintOrIp}` | `{ count }` | 1 min (sliding window) |

## New Endpoints

### `POST /organization/table/token/session` — Public, rate-limited

**Purpose**: Create device-bound session from QR token. Multiple calls with same token create independent sessions (each scanner gets own session).

**Request:**
```json
{
  "token": "base64url-encrypted-token",
  "deviceFingerprint": "sha256-of-client-signals" (optional),
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracyMeters": 25
}
```

`latitude`/`longitude`/`accuracyMeters` from browser `navigator.geolocation.getCurrentPosition()`. Accuracy used to determine confidence: ≤50m = high confidence, 50-200m = medium, >200m = degraded.

**Logic:**
1. Decrypt QR token → `{ tableId, organizationId }`
2. Lookup `table` by id to confirm exists + get org details
3. Rate limit check: per `deviceFingerprint` (if provided) or per IP. Max 5 sessions/min/device-fingerprint. Family of 4 on same WiFi: each has own fingerprint → each gets own limit.
4. (Optional) Geofence check: if browser sent `latitude`/`longitude`, verify within ~100m of restaurant address. Reject if outside.
5. Generate `sessionToken` = `randomBytes(32).toString('hex')`
6. Set `expiresAt` = `now + 6h` (configurable per org via org settings)
7. Insert into `qr_session` table
8. Set Redis `qr_session:{sessionToken}` with session data (TTL = 6h)
9. Return `{ sessionToken, expiresAt, organization: {...}, table: {...} }`

**Error responses:**
- `404` — table not found
- `403` — geofence check failed (outside restaurant area)
- `429` — rate limited (too many sessions from this device)

**Rate limit**: 5 req/min per device fingerprint (fallback: per IP)

**Geofence note**: If user denies browser location permission, session enters **degraded mode**: TTL = 1h (vs 6h), rate limit = 2/min (vs 5/min), device fingerprint required. This balances UX vs abuse: off-site attacker gets short window, on-site customer with privacy concerns still works.

### `POST /organization/table/token/session/refresh` — Public

**Purpose**: Extend session TTL (idle timeout reset).

**Request:**
```json
{
  "sessionToken": "...",
  "deviceFingerprint": "..." (optional)
}
```

**Logic:**
1. Validate session (exists, active, not expired)
2. Verify `deviceFingerprint` matches if stored
3. Extend `expiresAt` = `min(now + 6h, originalExpiresAt + 2h)` (cap extension)
4. Update `last_activity_at`
5. Update Redis TTL
6. Return `{ expiresAt }`

**Rate limit**: 10 req/min per device fingerprint (fallback: per IP)

### `DELETE /organization/table/token/session/:sessionId` — Dashboard (sessionMiddleware)

**Purpose**: Revoke specific session (e.g., customer left without checkout).

### `DELETE /organization/table/token/session/table/:tableId` — Dashboard (sessionMiddleware)

**Purpose**: Revoke ALL active sessions for a table (e.g., table reassigned).

Both endpoints set `status = 'revoked'` in DB and delete Redis key.

## New Middleware: `qrSessionMiddleware`

Location: `apps/api/src/middleware/qr-session.ts`

```typescript
async function qrSessionMiddleware(c: Context, next: () => Promise<void>) {
  const sessionToken =
    c.req.header("x-session-token") ?? c.req.query("sessionToken")

  if (!sessionToken) {
    return c.json({ status: "error", code: 401, message: "Session required" }, 401)
  }

  const session = await getValidSession(sessionToken)
  if (!session) {
    return c.json({ status: "error", code: 401, message: "Invalid or expired session" }, 401)
  }

  const clientFp = c.req.header("x-device-fingerprint")
  if (session.deviceFingerprint && clientFp && session.deviceFingerprint !== clientFp) {
    return c.json({ status: "error", code: 401, message: "Device mismatch" }, 401)
  }

  c.set("qrSession", session)
  await next()
}
```

**`getValidSession` helper:**

```typescript
async function getValidSession(sessionToken: string): Promise<QrSession | null> {
  const cached = await redisClient.get<QrSessionData>(`qr_session:${sessionToken}`)
  if (cached) {
    if (cached.status !== "active") return null
    if (new Date(cached.expiresAt) < new Date()) return null
    await redisClient.expire(`qr_session:${sessionToken}`, getRemainingTtl(cached.expiresAt))
    return cached
  }

  const [row] = await db
    .select()
    .from(qrSessionSchema)
    .where(eq(qrSessionSchema.sessionToken, sessionToken))

  if (!row || row.status !== "active" || row.expiresAt < new Date()) return null

  const sessionData: QrSessionData = {
    id: row.id,
    organizationId: row.organizationId,
    tableId: row.tableId,
    deviceFingerprint: row.deviceFingerprint,
    status: row.status,
    expiresAt: row.expiresAt.toISOString(),
  }

  const ttl = Math.floor((row.expiresAt.getTime() - Date.now()) / 1000)
  await redisClient.set(`qr_session:${sessionToken}`, sessionData, ttl)

  return sessionData
}
```

## Modified Existing Endpoints

### `GET /organization/table/token/decode`

- Add rate limiting: 10 req/min/IP
- Only return data (no session creation) — used for SSR metadata in `layout.tsx`
- Option: change `layout.tsx` to call decode with a read-only "preview" mode

### `POST /organization/orders/table/:tableId`

- Add `qrSessionMiddleware` before handler
- Handler reads `organizationId` and `tableId` from `c.get("qrSession")` instead of request body
- Validates `tableId` from URL matches `session.tableId`
- Remove `organizationId` from request body (now inferred from session)

### `GET /organization/orders/table/:tableId/active`

- Add `qrSessionMiddleware`
- Infer `organizationId` and `tableId` from session
- No breaking changes to response shape

### `GET /organization/orders/:orderId/invoice`

- Add `qrSessionMiddleware`
- Infer `organizationId` from session

### `GET /organization/menus` (if used by client-web)

- Add `qrSessionMiddleware` for customer-facing requests

## Client-Side Changes

### `apps/client-web/app/[token]/layout.tsx`

After SSR metadata fetch (keep existing decode call), add client component `<SessionInitializer />` that:
1. Calls `POST /table/token/session` with device fingerprint
2. Stores `sessionToken` in memory (React state) + httpOnly cookie fallback
3. Provides session token via React context

### `apps/client-web/hooks/use-session.ts` (new)

```typescript
// Returns { sessionToken, isValid, refresh }
// On mount: check existing session in context, refresh if close to expiry
// On error: redirect to token page to re-scan QR
```

### `apps/client-web/lib/axios.ts`

Add request interceptor:
```typescript
api.interceptors.request.use((config) => {
  const sessionToken = getSessionToken() // from context/cookie
  if (sessionToken) {
    config.headers["x-session-token"] = sessionToken
  }
  return config
})
```

### `apps/client-web/modules/providers/table-provider.tsx`

Instead of calling `useDecodeToken` directly:
1. Call session creation endpoint
2. Receive both `sessionToken` + `organization/table` data
3. Store `sessionToken` in context
4. Skip raw `useDecodeToken` — merge into session creation response

**Or keep both in parallel**: decode for SSR metadata, session creation for actual API auth.

### Device Fingerprint Generation

Client-side script that hashes browser signals:
```typescript
// apps/client-web/lib/device-fingerprint.ts
async function generateDeviceFingerprint(): Promise<string> {
  const signals = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    // Optional: AudioContext fingerprint (privacy-sensitive, can skip)
  ].join("|||")

  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signals))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("")
}
```

## Rate Limiting Strategy

Use Redis sliding window. Key selection priority:

1. `deviceFingerprint` when available (survives NAT — family on same WiFi)
2. Fallback: IP address

| Endpoint | Limit | Window | Key | Degraded |
|----------|-------|--------|-----|----------|
| `POST /table/token/session` | 5 | 1 min | fingerprint | 2/min (no geolocation) |
| `GET /table/token/decode` | 10 | 1 min | IP | same |
| `POST /table/token/session/refresh` | 10 | 1 min | fingerprint | 4/min |
| Any QR-session-protected endpoint | 30 | 1 min | sessionToken | same |
| `POST /order/table/:id` | 5 | 1 min | sessionToken | 2/min |

Implementation: generic `rateLimitMiddleware(key, limit, windowSeconds)` using Redis `INCR` + `EXPIRE`.

**Why fingerprint over IP for session creation**: 4 family members on same restaurant WiFi share 1 public IP. Per-IP limit of 5 would block 4th person. Per-fingerprint limit of 5 gives each person own budget.

## Session Lifecycle

```
CREATED (active, TTL=6h)
  │
  ├── Activity detected → refresh TTL (cap at original 6h)
  │
  ├── Idle > 30min → set status=expired (cron or lazy-check on next request)
  │
  ├── Dashboard revokes → set status=revoked
  │
  ├── expires_at reached → set status=expired (lazy on next request)
  │
  └── Table status changes to "available" → auto-revoke all active sessions
```

**Idle timeout**: Implemented lazily in `getValidSession` or via a periodic cron:
- In `getValidSession`: compute idle time from `last_activity_at`. If > 30min, reject.
- Cron (optional): `DELETE FROM qr_session WHERE last_activity_at < now() - interval '30 minutes' AND status = 'active'`

## Scalability Analysis

### Expected Load

| Metric | Per restaurant | Per 1000 restaurants |
|--------|---------------|---------------------|
| Tables | 20 | 20,000 |
| Seatings/night | 2 | 2,000 |
| Scans/table/seating | 3 (avg party size) | — |
| Session creations/day | 20 × 2 × 3 = 120 | 120,000 |
| Peak concurrent sessions | 20 tables × 3 people = 60 | 60,000 |
| Orders/day | 20 × 2 × 1.5 = 60 | 60,000 |

### DB

- `qr_session` row: ~300 bytes
- 120,000 rows/day × 365 = ~43M rows/year ≈ 12 GB/year
- Indexed on `session_token` (point lookups), `(status, expires_at)` (cleanup), `(table_id, organization_id)` (revoke by table)
- `session_token` UNIQUE index — 128-bit random, collision probability negligible
- Cleanup: `DELETE FROM qr_session WHERE expires_at < now() - interval '7 days'` (weekly cron)

### Redis

- Each session: ~200 bytes in JSON
- 60,000 concurrent sessions × 200 bytes = ~12 MB
- 6h TTL ensures automatic eviction
- Redis `SCAN` + `DEL` on table revoke — O(n) over active sessions for that table (max ~20)
- Rate limiter keys: ephemeral (60s TTL), negligible memory

### API Throughput

| Operation | Per-second peak (1000 orgs) | Bottleneck |
|-----------|---------------------------|------------|
| Session creation | 120,000 / 86400 ≈ 1.4 req/s | — |
| Session validation | 60,000 concurrent × 1 req/10s polling = 6,000 req/s | Redis: single-op `GET` per validation. Upstash Redis handles ~100K ops/s. |
| Order creation | 60,000 / 86400 ≈ 0.7 req/s | — |

No bottleneck even at 1000× scale. Session validation is the hottest path (polling every 10s from client-web). Each validation = single Redis `GET` — ~1ms at P99.

### Caching Strategy

- **Hot path (session validation)**: Redis only. DB never touched on session-bound requests.
- **Warm path (session creation)**: 1 DB insert + 1 Redis set. Rate limited to 5/min/device.
- **Cold path (token decode for SSR)**: DB read. Rate limited to 10/min/IP.
- **Cache miss recovery**: On Redis miss, fallback to DB query + repopulate Redis. Rare (only on Redis restart or key eviction).

## Multi-User at Same Table

When 4 people scan same QR:

```
QR: "https://order.rosterpro.in/{sameToken}"

Person A scan → POST /session → qr_session[A] created
Person B scan → POST /session → qr_session[B] created
Person C scan → POST /session → qr_session[C] created
Person D scan → POST /session → qr_session[D] created
```

Each gets own `sessionToken`, own device fingerprint, own TTL. All 4 sessions reference same `{tableId, orgId}`.

**Order placement**: Person A's orders → `tableSession[X]` (shared per-table session, existing behavior). Person B's orders → same `tableSession[X]`. All orders for that table visible to all 4 via `GET /orders/table/{id}/active`.

**Why this is safe**: Printed QR is static — anyone can scan it. The defense stack:
1. **Geofence**: Session creation checks browser location against restaurant address (±100m). Off-site attacker fails here.
2. **Device binding**: Even if geofence skipped (user denied location), session bound to fingerprint. Shared URL useless on different device.
3. **Aggressive rate limiting**: Without geofence: 2 sessions/min/device, 1h TTL. Prevents bulk abuse.
4. **Session isolation**: Each scanner gets own session. One compromised session doesn't leak others.

## Migration Path

### Phase 1: Parallel Run (no breaking changes)
1. Add `qr_session` table and schema
2. Add `POST /table/token/session` endpoint (new, alongside existing)
3. Add `qrSessionMiddleware` (not yet attached to any route)
4. Deploy — zero impact

### Phase 2: Session Creation
1. Deploy client-web change: on QR scan, call session creation endpoint
2. Store session token in context
3. Existing decode endpoint still works — users sharing old links still functional

### Phase 3: Enforce Session
1. Attach `qrSessionMiddleware` to order endpoints
2. If no valid session, return 401
3. Old bookmarks/links break after session expiry (6h) — expected behavior
4. Monitor error rates

## Security Analysis

| Threat | Mitigation |
|--------|------------|
| QR code photographed, shared on Twitter, 1000 off-site scans | **Geofence is primary defense**: browser location checked against restaurant address (±100m) during session creation. Off-site scanner: browser location won't match → session denied. User denies location: degraded mode (1h TTL, 2/min rate limit, device fingerprint required). |
| Off-site attacker spoofs browser geolocation | Hard to spoof accurately (requires browser flag or devtools). Even if spoofed: device fingerprint + rate limiting + 1h TTL limit damage window. |
| Session token leaked (MITM) | Enforce HTTPS. Device binding makes token useless on different device. |
| Session token brute-forced | 128-bit random (32 bytes hex). Rate limited at 30 req/min. |
| QR token decryption key leaked | Key rotation via env var. Tokens contain only `{tableId, orgId}` — no PII. |
| Customer shares QR photo with friend outside | Geofence blocks friend's session creation (friend not at restaurant location). Even if friend spoofs location: device fingerprint + rate limited. |
| DOS via session creation | 5/min per device fingerprint. Each session = 1 DB insert + 1 Redis set. At 5 req/min × 1000 devices = 5000 writes/min = ~83/sec. Postgres handles this trivially. |
| Printed QR never expires, table reused daily | Sessions are ephemeral (max 6h). Tomorrow's customers create fresh sessions. No long-term token leakage. `table.qrToken` is just a table identifier, not a credential. |
| QR displayed on digital menu board (screen) in restaurant | Works fine. Every customer at restaurant scans same screen QR, gets own device-bound session. Geofence passes (all in restaurant). |

## Open Questions

1. **Idle timeout value**: 30 min reasonable? Configurable per-org?
2. **Max session duration**: 6h enough for a dinner service? Configurable?
3. **Device fingerprint**: Required or optional? Privacy implications of hashing browser signals. Needed for degraded mode (when geolocation denied).
4. **Geofence radius**: 100m reasonable? Configurable per-org? What about restaurants in multi-story buildings (same lat/lng for different floors)?
5. **Degraded mode UX**: When geolocation denied, show toast "Enable location for full session (6h) or continue with 1h session"?
6. **Session migration on table change**: If customer moves to different table, do they need new QR? Current design: yes (token bound to tableId). Could add table-transfer endpoint for staff use.
7. **Digital vs printed QR detection**: Same `generateQrToken` endpoint serves both. If org uses digital displays (auto-rotating QR), could enable shorter token refresh cycles. For printed: never refresh.
