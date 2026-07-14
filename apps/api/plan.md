# Round-based Order Item Status

## Context

An order has a single `status` field (`pending → confirmed → preparing → ready → served → completed → cancelled`) and its line items live denormalized as a JSONB `items[]` array on the `order` row. When a customer adds items to an existing active order, the append logic (`orders.logic.ts:600-668`) merges items into that array but **leaves the order status untouched** — so a `ready` order stays `ready` even though the new items still need cooking.

Goal: adding new items should surface them to the kitchen as fresh work, **without** knocking already-ready items back to pending, and already-ready items must be able to advance to `served` independently. Per-individual-item status was rejected as too many clicks for staff.

**Chosen model:** round/batch-based. Items added together form a *round*; each round carries its own status; staff advance a whole round in one click. The order's top-level `status` becomes a **derived rollup** of the round statuses so the existing dashboard filter, stats, and table-freeing logic keep working unchanged.

## Approach

### 1. Stored item type (shared package)

- New file `packages/shared/src/schemas/order/order-item/stored.ts`:
  ```ts
  export const StoredOrderItemSchema = CreateOrderItemSchema.extend({
    round: z.number().int().positive(),
    status: OrderStatus,
  })
  export type StoredOrderItem = z.infer<typeof StoredOrderItemSchema>
  ```
- Export it from `order-item/index.ts` (mirror the existing export blocks).
- Do **not** add `round`/`status` to `CreateOrderItemSchema` — those are server-assigned, not client-supplied.
- Extend `order-item/base.ts` `OrderItemSchema` with `round: z.number().optional()` and `status: OrderStatus.optional()` (optional first; can tighten after backfill) so realtime/`getById` response payloads validate.
- Point `OrderItemJson` in `apps/api/src/core/db/schemas/order.ts:19` at `StoredOrderItem`. The `jsonb().$type<OrderItemJson[]>()` column carries the new fields with **no DDL change** (JSONB is schemaless at the DB level).

### 2. Derivation helper (`orders.logic.ts`)

Add a pure helper near the top:
```ts
const STATUS_RANK = { pending:0, confirmed:1, preparing:2, ready:3, served:4, completed:5, cancelled:6 }
function deriveOrderStatus(items: OrderItemJson[]): OrderStatus {
  if (items.length === 0) return "pending"
  const active = items.filter(it => (it.status ?? "pending") !== "cancelled")
  if (active.length === 0) return "cancelled"
  // least-advanced active round drives the rollup
  return active.reduce((min, it) =>
    STATUS_RANK[it.status ?? "pending"] < STATUS_RANK[min] ? (it.status ?? "pending") : min,
    active[0].status ?? "pending")
}
```
Rules: least-advanced **active** round wins (a new pending round pulls the order back to `pending` for the kitchen, while an earlier `ready` round keeps its own status and can advance independently); `served`/`completed` only when *all* active rounds reach it (falls out of the min); cancelled rounds are excluded so one cancelled batch doesn't drag the order down; order is `cancelled` only when every round is cancelled. A single-round order returns its one status → fully backward compatible with the existing filter/stats.

### 3. Create flow (`orderLogic.create`, ~line 335)

Normalize items before insert:
```ts
const items = (body.items ?? []).map(it => ({ ...it, round: 1, status: "pending" as const }))
```
Set the row `status: deriveOrderStatus(items)`. Because `createOrAppend`'s no-active branch delegates to `create`, this one place guarantees the round-1 invariant.

### 4. Append flow (`createOrAppend`, replace merge block `600-668`)

- Compute `newRound = max(existing item.round ?? 1) + 1`.
- Dedupe **within the incoming payload** by `(menuItemId, variant)` (sum quantity), stamp `round: newRound, status: "pending"`, then **append** to `active.items` — never merge into existing rounds (merging into an already-`ready` round is the exact bug).
- `merged = [...active.items, ...newRoundItems]`; recompute totals over `merged` (unchanged math).
- Set `status: deriveOrderStatus(merged)`.
- Keep the existing cache-invalidation + `publishOrderEvent("order.updated")` at `654-662`.

### 5. Round status update endpoint

- Validation (`orders.validation.ts`): `updateRoundStatusSchema = z.object({ status: OrderStatus })`.
- Logic `orderLogic.updateRoundStatus(id, round, status, organizationId)` (model on `updateStatus:756`): load order (404 if missing), 404 if no item has that round, `items.map(it => it.round === round ? { ...it, status } : it)`, recompute row `status = deriveOrderStatus(newItems)`, persist `{ items, status, updatedAt }`, apply the same table-free/occupy side effect keyed on the **derived** status, `emitTableStatus`, cache del (`order:{org}:{id}`, `order:all:{org}`), `publishOrderEvent("order.updated")`.
- Route (`orders.route.ts`, after `/:id/status`): `PATCH /:id/round/:round/status` with `sessionMiddleware` + `zvalidator("json", updateRoundStatusSchema)`, org-guard like the sibling routes, parse `round` param as a positive int (400 otherwise).

### 6. Keep whole-order status in sync (`updateStatus` ~756, `update` ~671)

When the legacy "set the whole order status" path runs, also stamp **every item's** `status` to the target so items and the derived rollup can't drift on a later append. Table-freeing side effect is unchanged and stays correct — the derived rollup only reaches `completed`/`cancelled` when all rounds do.

### 7. Backfill migration

No DDL needed — data-only. Add `drizzle/0008_round_backfill.sql` (+ matching `drizzle/meta/_journal.json` entry, since drizzle-kit won't emit data-only migrations):
```sql
UPDATE "order"
SET "items" = (
  SELECT jsonb_agg(elem || jsonb_build_object('round', 1, 'status', "order"."status"))
  FROM jsonb_array_elements("items") AS elem
)
WHERE "items" IS NOT NULL
  AND jsonb_array_length("items") > 0
  AND NOT jsonb_path_exists("items", '$[*].round');
```
The `NOT jsonb_path_exists(...round)` guard makes re-runs idempotent. Existing `ready` order → round-1 `ready` items → `deriveOrderStatus` reproduces `ready`. Verify the journal format (version 7, `breakpoints: true`, next `idx: 8`) before appending. Keep read paths defensive (`it.round ?? 1`, `it.status ?? "pending"`) as belt-and-suspenders for partially-migrated rows.

## Files to modify

- `packages/shared/src/schemas/order/order-item/stored.ts` (new)
- `packages/shared/src/schemas/order/order-item/index.ts`, `base.ts`
- `apps/api/src/core/db/schemas/order.ts` (`OrderItemJson` → `StoredOrderItem`)
- `apps/api/src/routes/organization/orders/orders.logic.ts` (`deriveOrderStatus`, `create`, `createOrAppend`, `updateStatus`, `update`, new `updateRoundStatus`)
- `apps/api/src/routes/organization/orders/orders.validation.ts` (`updateRoundStatusSchema`)
- `apps/api/src/routes/organization/orders/orders.route.ts` (new PATCH route)
- `drizzle/0008_round_backfill.sql` + `drizzle/meta/_journal.json`

## Edge cases

- All rounds cancelled → order `cancelled`, table freed.
- Mixed served + pending → derived `pending`, table stays occupied, earlier round independently advanceable (the core requirement).
- Same `(menuItemId, variant)` twice in one append payload → summed within the new round; never merged across rounds.
- Empty items / legacy pre-backfill rows → defensive `?? 1` / `?? "pending"`.
- Unknown round param → 404, not a silent no-op.

## Verification

1. Run the API locally (`pnpm --filter api dev` or the repo's dev script) with Upstash env vars set.
2. `POST /organization/orders/table/:tableId` to create an order → confirm all items are `round: 1, status: "pending"` and order status `pending`.
3. `PATCH /:id/round/1/status` → `ready`; confirm order status `ready`.
4. `POST /organization/orders/table/:tableId` again (append) → confirm new items land in `round: 2, status: "pending"`, round-1 items stay `ready`, and derived order status drops to `pending`.
5. `PATCH /:id/round/1/status` → `served` while round 2 still pending → confirm round 1 is `served`, order status stays `pending` (min of served+pending), table still `occupied`, and an `order.updated` realtime event fires on `orders:{orgId}`.
6. Advance all rounds to `completed` → confirm order `completed` and the table is freed to `available`.
7. Run the backfill against a seeded DB with pre-existing orders → confirm every item gets `round:1` + its order's status, and re-running the migration is a no-op.
