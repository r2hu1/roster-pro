# Orders Realtime — Scaling Plan

Status of the orders board (`apps/web/modules/orders`) after the pagination +
SSE-delta refactor, and the work still required to run it at thousands of
concurrent realtime orders / connections.

## What already shipped (done)

- **Keyset pagination** (`orderLogic.getPaginated`) over `(createdAt, id)` desc,
  backed by composite index `order_org_created_idx`. O(limit) at any depth.
  Server-side `status` + `search` filtering. `GET /v1/organization/orders`.
- **Stats endpoint** (`orderLogic.getStats`, `GET .../orders/stats`): status
  counts via `GROUP BY`, so cards stay accurate independent of the loaded page.
- **SSE is a pure delta channel**: `GET .../orders/stream` no longer dumps the
  whole table on connect (removed the unbounded `init`); emits `ready` + `ping`
  + `created`/`updated`/`deleted` deltas only.
- **Client** (`use-orders-stream.ts`): REST owns the snapshot + `loadMore`
  (infinite scroll); SSE deltas merge into a keyed store; **snapshot re-syncs on
  every SSE reconnect** (heals missed-event gaps); stats debounce-refetch on
  deltas.

The **pagination layer scales to millions of rows**. The **realtime layer is
currently single-instance only**. The items below make the realtime layer
horizontally scalable and production-hardened.

---

## P0 — Cross-instance fan-out (the hard blocker)

**Problem.** `orderEmitter` (`orders.logic.ts`) is an in-process Node
`EventEmitter`. A mutation on API instance A only notifies SSE clients connected
to instance A. The moment we run >1 API instance — required for thousands of
long-lived SSE connections — realtime silently half-breaks: some clients never
see some updates. `orderEmitter.setMaxListeners(1000)` also caps ~1000
concurrent streams per process.

**Constraint.** Current Redis is **Upstash REST** (`@upstash/redis`), which is
HTTP request/response — it has **no persistent `SUBSCRIBE`**, so it cannot be
the pub/sub transport as-is.

**Options (pick one):**
1. **Real Redis pub/sub** (`ioredis` against a TCP Redis / Upstash's Redis
   protocol endpoint, not the REST client). Each instance `SUBSCRIBE`s to
   `orders:<orgId>`; mutations `PUBLISH`. Smallest conceptual change — replace
   the emitter's `.emit`/`.on` with publish/subscribe. **Recommended.**
2. **Postgres `LISTEN/NOTIFY`.** No new infra (already on Postgres). Caveats:
   payload size limit (~8KB — publish the order id, refetch), one dedicated
   listener connection per instance, not partition-tolerant. Good if we want
   zero new dependencies.
3. **Dedicated broker** (NATS / Redis Streams / Kafka). Overkill now; revisit
   only if we need replay/persistence or fan-out beyond one Redis.

**Acceptance:** run 3 API instances behind the LB; a mutation on any instance
reaches an SSE client on every other instance within ~100ms.

**Touch points:** `orders.logic.ts` (every `orderEmitter.emit`), the `/stream`
handler in `orders.route.ts` (subscribe instead of `.on`), plus the same
pattern already duplicated in `analytics.logic.ts` and `table.logic.ts` — do
all three, they share the bug.

---

## P1 — Deployment target must hold long-lived connections

**Problem.** SSE needs a connection open for minutes/hours. Serverless platforms
(Vercel functions, Lambda) cap execution time and will kill the stream; some
proxies buffer `text/event-stream` and defeat push.

**Action.**
- Confirm where `apps/api` runs. If serverless → move the streaming routes to a
  long-running target (container / node server / edge runtime that supports
  streaming), or adopt a managed realtime transport.
- Verify the proxy chain passes SSE through unbuffered end-to-end. The Next
  route already sets `X-Accel-Buffering: no` + `no-transform`; confirm the LB /
  CDN in front honors it.
- Set connection limits + a max-lifetime on streams (force periodic reconnect,
  e.g. every ~30–60 min) so instances can drain/deploy cleanly. Client already
  re-syncs on reconnect, so forced cycling is safe.

**Acceptance:** a board stays live > 1h across a rolling deploy with no manual
refresh.

---

## P2 — Stats without a full table scan per event

**Problem.** `getStats` runs `COUNT(*) ... GROUP BY status` across the whole
`order` table. Debounced, but still a full-table aggregate per burst. Fine at
thousands of rows; expensive at millions × many active boards.

**Options:**
1. **Maintained counters**: a `order_status_counts(orgId, status, count)` table
   (or Redis hash) incremented/decremented in the create/update/status/delete
   transactions. Reads become a point lookup. Most robust.
2. **Cache with short TTL** (e.g. Redis `orders:stats:<orgId>`, 2–5s) — cheap,
   bounds the query rate regardless of delta volume. Good interim step.
3. Partial index / materialized view if we stay on live aggregation.

**Recommendation:** ship (2) now as a guard, plan (1) for real scale.

**Touch points:** `getStats`; and the mutation paths in `orders.logic.ts` if we
go with maintained counters (increment alongside the existing cache
invalidation).

---

## P2 — Backpressure & slow-client safety on the stream

**Problem.** The `/stream` listener calls `stream.writeSSE(...)` **without
awaiting**. A slow/stalled client can let writes queue and grow memory; a
throwing write isn't isolated per subscriber.

**Action.**
- Await (or queue with a bounded buffer) per-connection writes; drop the
  connection if it falls too far behind (client will reconnect + re-sync).
- Wrap each subscriber's write so one bad client can't take down the emit path.
- Consider coalescing bursts (e.g. per-order latest-wins) under heavy churn.

---

## P3 — Correctness / polish

- **Search quality**: `ILIKE '%q%'` can't use a btree index (leading wildcard).
  At scale add `pg_trgm` GIN index on the searched columns, or move to a search
  service. Today it's a filtered scan.
- **`getAll` + `order:all:<org>` Redis cache** is now dead for the list/stream
  path. Remove it (and its `delPattern` invalidations) once nothing else reads
  it, to drop write-path overhead.
- **Per-org authorization on `/stream`**: confirm `sessionMiddleware` fully
  scopes the subscription to the caller's org (it drives the channel name — must
  not be client-supplied).
- **`Last-Event-ID` replay (optional upgrade)**: with a broker that retains a
  short history, resend missed deltas on reconnect instead of a full page-0
  re-sync. Lighter than resync; only worth it if reconnect churn is high.
- **Migration**: `order_org_created_idx` was added to the Drizzle schema
  (`core/db/schemas/order.ts`). Generate + apply it:
  `pnpm --filter api db:generate && pnpm --filter api db:migrate`
  (build it `CONCURRENTLY` in prod to avoid locking the table).

---

## Suggested order of execution

1. **Migration** for `order_org_created_idx` (unblocks pagination perf). — small
2. **P0 fan-out** (Redis pub/sub or LISTEN/NOTIFY). — the real unlock
3. **P1 deploy target** verification. — must pair with P0
4. **P2 stats cache**, then **stream backpressure**. — hardening
5. **P3** cleanup + search index as load dictates.

## How to load-test

- N synthetic SSE clients across ≥2 instances; drive create/update mutations;
  assert every client observes every delta and stats converge.
- Kill one instance mid-stream; confirm clients reconnect and re-sync (no
  missing/duplicate orders — dedupe is by id).
- Deep-paginate under continuous inserts; confirm no dupes/skips (keyset).
