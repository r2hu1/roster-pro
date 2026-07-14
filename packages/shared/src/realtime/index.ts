import { z } from "zod"

/**
 * Single source of truth for the realtime event schema shared by the API
 * (publisher), the Next.js subscribe endpoint, and the browser client.
 *
 * Keep this file free of `@upstash/*` imports so it stays usable from every
 * runtime (node, edge, browser) without pulling server-only deps.
 */
export const realtimeSchema = {
  order: { created: z.any(), updated: z.any(), deleted: z.any() },
  table: { status: z.any(), deleted: z.any() },
  analytics: { updated: z.any() },
}

export type RealtimeSchema = typeof realtimeSchema

/**
 * Channel-name builders. Every channel is namespaced by `organizationId` so
 * the subscribe endpoint can authorize a connection against the caller's org
 * without a per-channel database lookup.
 */
export const channels = {
  orders: (organizationId: string) => `orders:${organizationId}`,
  order: (organizationId: string, orderId: string) =>
    `order:${organizationId}:${orderId}`,
  table: (organizationId: string) => `table:${organizationId}`,
  analytics: (organizationId: string) => `analytics:${organizationId}`,
}

/**
 * Returns true when `channel` belongs to `organizationId`. Used by the
 * subscribe endpoint to reject cross-tenant subscription attempts.
 */
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
