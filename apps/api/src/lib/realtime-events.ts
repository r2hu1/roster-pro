import { realtime } from "./realtime.js"
import { channels } from "@workspace/shared/realtime"

type OrderEvent = "order.created" | "order.updated" | "order.deleted"
type TableEvent = "table.status" | "table.deleted"

/**
 * Emit a single event without ever blocking or throwing into the request path.
 * Realtime delivery is best-effort; the database write is the source of truth
 * and clients reconcile via snapshot refetch on reconnect.
 */
async function safeEmit(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await realtime?.channel(channel)?.emit(event as any, data)
  } catch (err) {
    console.error(`[realtime] emit failed (${channel} ${event})`, err)
  }
}

/**
 * Fan an order change out to the org-wide list channel, the per-order channel,
 * and the analytics channel. Fire-and-forget — callers must not await this.
 */
export function publishOrderEvent(
  organizationId: string,
  orderId: string,
  event: OrderEvent,
  data: unknown
): void {
  void Promise.all([
    safeEmit(channels.orders(organizationId), event, data),
    safeEmit(channels.order(organizationId, orderId), event, data),
    safeEmit(channels.analytics(organizationId), "analytics.updated", null),
  ])
}

/** Fan a table change out to the org table channel. Fire-and-forget. */
export function publishTableEvent(
  organizationId: string,
  event: TableEvent,
  data: unknown
): void {
  void safeEmit(channels.table(organizationId), event, data)
}
