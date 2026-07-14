# Roster Pro — Order Tracking Migration Plan

Two production-grade paths to resolve item tracking for consolidated active orders.

---

## Approach 1: Rejected

---

## Approach 2: Relational Sub-Orders / Table Sessions (Recommended)

_Splits consolidation into relational database entities. Standard Kitchen Order Ticket (KOT) workflow._

```
┌─────────────────────────────────────────┐
│              table_session              │
│  (id, table_number, status: "active")   │
└───────────────────┬─────────────────────┘
                    │ 1
                    │
                    │ 1..N
┌───────────────────▼─────────────────────┐
│                 order                   │
│   (id, table_session_id, status, items) │
│   * Represents 1 Prep Ticket / Round *  │
└─────────────────────────────────────────┘
```

### Step 1: Create Database Migrations

File: `apps/api/src/core/db/schemas/order.ts` and `table.ts`

- Create `table_session` schema:
  ```typescript
  export const tableSession = pgTable("table_session", {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    organizationId: text("organization_id").notNull(),
    tableNumber: text("table_number").notNull(),
    status: text("status")
      .$type<"active" | "completed">()
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  ```
- Add `tableSessionId` foreign key to `order` table.
- Generate migrations: `bun drizzle-kit generate`.

### Step 2: Rewrite API Logic

File: `apps/api/src/routes/organization/orders/orders.logic.ts`

- Modify `createOrAppend`:
  - Find active `table_session` for table. If none, create one.
  - Create **new** `order` record representing this specific round (ticket).
  - Link it to the `tableSessionId`.
  - Recalculate totals at ticket-level.
- Add consolidated billing endpoint `GET /orders/session/:sessionId/bill`:
  - Fetch all orders for `tableSessionId`.
  - Sum subtotals, calculate combined tax, discount, and grand total.

### Step 3: Write Data Migration Script

File: `apps/api/scripts/migrate-to-sessions.ts`

- Script:
  - Select all existing orders.
  - For each active table group or individual order, create a `table_session`.
  - Update `order` row with corresponding `tableSessionId`.

### Step 4: UI Refactoring

- **Admin Dashboard (`apps/web`)**:
  - Kitchen View: Renders each individual order record as a separate prep card. Realtime trigger is standard table `INSERT`.
  - Checkout/Cashier View: Query `GET /orders/session/:sessionId/bill` to print consolidated invoice and complete payment (sets `table_session.status = "completed"`).
- **Customer UI (`apps/client-web`)**:
  - Render list of all sub-orders under active `tableSessionId` showing status per-round.
