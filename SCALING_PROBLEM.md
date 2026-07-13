# Orders Realtime — Scaling Plan

This document explains where the live orders board stands today and what the
team needs to do before it can handle thousands of orders and many kitchens
watching at once.

Code lives in `apps/web/modules/orders` (frontend) and
`apps/api/src/routes/organization/orders` (backend).

---

## Background: how the orders board works now

Two separate mechanisms feed the board:

1. **The list** — a normal REST request that returns one page of orders (newest
   first). Scrolling down asks for the next page. This is fast and stays fast no
   matter how many orders exist.
2. **The live updates** — a long-lived connection called **SSE** (Server-Sent
   Events). The browser opens it once and keeps it open; the server *pushes* a
   small message down it whenever an order is created, updated, or deleted. No
   polling, no refresh button.

When an order changes, the backend does two things: it writes to the database,
and it announces the change so every open SSE connection can forward it to the
browser. The browser merges that change into the page it's already showing.

**The good news:** the list/pagination part scales to millions of orders.
**The problem:** the "announce the change" part only works when the whole
backend runs as a *single* process. That's the core of what follows.

---

## The one-line summary

- Pagination: **production-ready**, scales to millions of rows.
- Live updates: **work today on a single server**, but break quietly the moment
  we run more than one server — which we must do to support thousands of
  simultaneous viewers.

---

## P0 — Live updates break when we run more than one server

**This is the blocker. Everything else is secondary.**

### What's happening

To announce changes, the backend uses an in-memory `EventEmitter` (a plain
Node.js object that lets one part of the process notify another). It lives
*inside a single running process*. When an order changes, it shouts "order
updated!" and every SSE connection **in that same process** hears it.

To handle thousands of viewers, we have to run several copies of the backend
side by side (this is "horizontal scaling" — more servers sharing the load, a
load balancer spreading connections across them). The instant we do that, the
in-memory announcer stops working correctly:

- A waiter's tablet is connected to **Server A**.
- A new order is saved on **Server B**.
- Server B shouts "new order!" — but only things *inside Server B* hear it.
- The tablet on Server A never finds out. The order silently never appears.

Some viewers see updates, some don't, seemingly at random. There's also a hard
ceiling of ~1000 live connections per process baked into the current code.

### Why we can't just reuse our existing Redis

The natural fix is a shared "announcement channel" that every server listens to.
Redis has exactly this (called pub/sub — publish/subscribe). But our Redis is
**Upstash's REST version**, which talks over one-off HTTP requests. It has no
way to *hold a subscription open*, so it can't be the always-listening channel
we need. We'd need a different connection method or a different tool.

### The options (pick one)

1. **Real Redis pub/sub** — connect to Redis over its normal protocol (with a
   library like `ioredis`) instead of the REST version. Every server subscribes
   to a channel per organization; a change gets published once and all servers
   receive it. Smallest change to our code. **Recommended.**
2. **Postgres LISTEN/NOTIFY** — Postgres (which we already use) can broadcast
   messages too. No new infrastructure. Downsides: messages are size-limited (so
   we'd send just the order ID and re-fetch the order), and it needs a dedicated
   database connection per server.
3. **A dedicated message broker** (NATS, Kafka, Redis Streams) — more powerful,
   but overkill right now. Only worth it if we later need message history/replay.

### Done when

We can run 3 backend servers behind the load balancer, change an order on any
one of them, and every connected viewer — no matter which server they're on —
sees the update within ~100 milliseconds.

### Where to change it

Every `orderEmitter.emit(...)` in `orders.logic.ts`, plus the `/stream` handler
in `orders.route.ts`. **Note:** the exact same pattern (and therefore the same
bug) also exists in `analytics.logic.ts` and `table.logic.ts` — fix all three
together.

---

## P1 — Make sure our hosting can keep connections open for hours

### What's happening

SSE relies on a connection staying open for a long time — potentially a whole
shift. Some hosting setups fight this:

- **Serverless platforms** (Vercel functions, AWS Lambda) force code to finish
  within seconds and will cut the connection off.
- Some proxies/CDNs **buffer** the stream (hold messages back instead of passing
  them through instantly), which defeats the whole point of live updates.

### What to do

- Confirm where `apps/api` actually runs. If it's serverless, move the streaming
  routes to something that allows long-running connections (a container or
  always-on server), or adopt a managed realtime service.
- Check the whole path from server to browser passes the stream through
  immediately without buffering. Our code already sends the right hints
  (`X-Accel-Buffering: no`); confirm the load balancer / CDN in front respects
  them.
- Have connections voluntarily restart every 30–60 minutes. Because the browser
  now re-syncs whenever it reconnects (see the note below), cycling connections
  is safe and lets us deploy new versions without stranding anyone on an old one.

### Done when

A board stays live for over an hour, and survives a routine deployment, without
anyone hitting refresh.

---

## P2 — Stop recounting the whole table for the stat cards

### What's happening

The cards at the top (Total, Pending, Ready, etc.) come from a query that counts
every order in the organization, grouped by status. We already limit how often
it runs, but each run still scans the entire orders table. That's fine with
thousands of orders; with millions — multiplied by many open boards — it becomes
a heavy, repeated query.

### Options

1. **Keep running totals** — a small table (or Redis entry) that holds the count
   per status, nudged up or down whenever an order is created, changed, or
   deleted. Reading the stats becomes an instant lookup. Most robust.
2. **Cache the counts briefly** — store the result for a few seconds so rapid
   changes don't trigger a fresh count each time. Cheap, easy, good stopgap.

**Suggested:** do option 2 now as a safety valve, plan option 1 for real scale.

### Where to change it

`getStats` in `orders.logic.ts` (and, for option 1, the create/update/delete
paths where counts would be adjusted).

---

## P2 — Protect the stream from slow viewers

### What's happening

When the server pushes a message to a viewer, it doesn't wait to confirm it was
sent. If one viewer's connection is slow or stuck, undelivered messages can pile
up in memory, and one misbehaving connection isn't isolated from the rest.

### What to do

- Wait for (or queue, with a size limit) each viewer's messages; if a viewer
  falls too far behind, drop their connection — the browser will reconnect and
  re-sync automatically.
- Wrap each send so one broken connection can't disrupt the others.
- Under heavy bursts, collapse rapid repeated updates to the same order into just
  the latest one.

---

## P3 — Smaller correctness and cleanup items

- **Search speed:** the current search (`ILIKE '%term%'`) can't use a normal
  index because of the leading wildcard, so it scans. At scale, add a trigram
  index (`pg_trgm`) on the searched columns, or move search to a dedicated
  service.
- **Remove dead code:** `getAll` and its Redis cache (`order:all:<org>`) are no
  longer used by the list or the stream. Delete them once nothing else depends
  on them, to save work on every write.
- **Double-check stream authorization:** the SSE connection is scoped to the
  caller's organization. Confirm that scope comes from the verified session, not
  from anything the client can send.
- **Optional upgrade — replay missed messages:** with a broker that keeps a short
  history, on reconnect we could resend just the messages a viewer missed instead
  of re-fetching the first page. Lighter, but only worth it if reconnects are
  frequent.
- **Run the database migration:** a new index (`order_org_created_idx`) was added
  in the schema to keep pagination fast, but it hasn't been applied yet. Run:
  ```
  pnpm --filter api db:generate && pnpm --filter api db:migrate
  ```
  In production, create the index `CONCURRENTLY` so it doesn't lock the table.

---

## Already done (context)

- **Pagination** that stays fast at any depth, with server-side status filtering
  and search.
- **Stats endpoint** so the cards are correct even though the browser only holds
  one page.
- **Slimmed-down stream:** it no longer sends the entire orders table when a
  viewer connects — just live changes.
- **Reconnect healing:** if the connection drops (network blip, deploy), the
  browser re-fetches the latest page on reconnect, so any changes it missed while
  disconnected are recovered.

---

## Suggested order of work

1. **Run the migration** — quick, makes pagination fast.
2. **P0: shared announcement channel** — the real unlock for multiple servers.
3. **P1: confirm hosting** supports long-lived connections — pairs with P0.
4. **P2: cache the stats, then protect the stream** — hardening.
5. **P3: cleanup and search index** — as load demands.

## How to test it under load

- Open many simulated viewers across at least two servers, fire a stream of
  order changes, and confirm every viewer sees every change and the stats agree.
- Kill one server mid-stream; confirm viewers reconnect and re-sync with no
  missing or duplicated orders.
- Scroll deep into the history while new orders keep arriving; confirm no
  duplicates and nothing skipped.
