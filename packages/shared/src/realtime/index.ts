import { z } from "zod"

export const realtimeSchema = {
  order: { created: z.any(), updated: z.any(), deleted: z.any() },
  table: { status: z.any(), deleted: z.any() },
  session: { ended: z.any() },
  analytics: { updated: z.any() },
}

export type RealtimeSchema = typeof realtimeSchema

export const channels = {
  orders: (organizationId: string) => `orders:${organizationId}`,
  order: (organizationId: string, orderId: string) =>
    `order:${organizationId}:${orderId}`,
  table: (organizationId: string) => `table:${organizationId}`,
  analytics: (organizationId: string) => `analytics:${organizationId}`,
}

export function isChannelAuthorized(
  channel: string,
  organizationId: string
): boolean {
  if (!organizationId) return false
  return (
    channel === channels.orders(organizationId) ||
    channel === channels.table(organizationId) ||
    channel === channels.analytics(organizationId) ||
    channel.startsWith(`order:${organizationId}:`)
  )
}
