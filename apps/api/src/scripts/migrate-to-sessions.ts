import { db } from "../core/db/client.js"
import { order } from "../core/db/schemas/order.js"
import { tableSchema, tableSession } from "../core/db/schemas/table.js"
import { and, eq, isNull } from "drizzle-orm"

async function run() {
  console.log("Starting migration to table sessions...")

  // 1. Fetch all orders that don't have tableSessionId
  const legacyOrders = await db
    .select()
    .from(order)
    .where(isNull(order.tableSessionId))

  if (legacyOrders.length === 0) {
    console.log("No legacy orders found.")
    process.exit(0)
  }

  console.log(`Found ${legacyOrders.length} legacy orders to migrate.`)

  // 2. Fetch all tables to map tableNumber to tableId
  const tables = await db.select().from(tableSchema)
  const tableMap = new Map<string, string>() // key: orgId_tableNumber, value: tableId
  for (const t of tables) {
    tableMap.set(`${t.organizationId}_${t.number}`, t.id)
  }

  // Group orders by organizationId and tableNumber
  const groups: Record<string, typeof legacyOrders> = {}
  for (const ord of legacyOrders) {
    const key = `${ord.organizationId}_${ord.tableNumber}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(ord)
  }

  const SESSION_WINDOW_MS = 2 * 60 * 60 * 1000 // 2 hours

  for (const [key, groupOrders] of Object.entries(groups)) {
    const [orgId, tableNumber] = key.split("_")
    const tableId = tableMap.get(key)

    if (!tableId) {
      console.warn(
        `Could not find tableId for table number ${tableNumber} in org ${orgId}. Skipping...`
      )
      continue
    }

    // Sort orders in this group by createdAt ascending
    groupOrders.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    let currentSessionId: string | null = null
    let sessionStartTime = 0

    for (const ord of groupOrders) {
      const orderTime = new Date(ord.createdAt).getTime()

      // Create new session if no session exists or order is outside window
      if (
        !currentSessionId ||
        orderTime - sessionStartTime > SESSION_WINDOW_MS
      ) {
        // Determine status: if order is active, session is active; otherwise completed
        const isOrderActive = [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "served",
        ].includes(ord.status)

        const [newSession] = await db
          .insert(tableSession)
          .values({
            organizationId: orgId,
            tableId,
            tableNumber,
            status: isOrderActive ? "active" : "completed",
            createdAt: new Date(ord.createdAt),
          })
          .returning()

        currentSessionId = newSession.id
        sessionStartTime = orderTime
        console.log(
          `Created table session ${currentSessionId} for table ${tableNumber} (Org: ${orgId})`
        )
      }

      // Link order to session
      await db
        .update(order)
        .set({ tableSessionId: currentSessionId })
        .where(eq(order.id, ord.id))
    }
  }

  console.log("Migration completed successfully!")
  process.exit(0)
}

run().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
