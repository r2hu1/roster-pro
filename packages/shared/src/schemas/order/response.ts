import { z } from "zod"
import { OrderSchema } from "./base.js"

export const OrderResponseSchema = OrderSchema

export type OrderResponse = z.infer<typeof OrderResponseSchema>

export const OrderListResponseSchema = z.array(OrderSchema)

export type OrderListResponse = z.infer<typeof OrderListResponseSchema>

export const OrderPageSchema = z.object({
  data: z.array(OrderSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export type OrderPage = z.infer<typeof OrderPageSchema>

export const OrderStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  confirmed: z.number(),
  preparing: z.number(),
  ready: z.number(),
  served: z.number(),
  completed: z.number(),
  cancelled: z.number(),
})

export type OrderStats = z.infer<typeof OrderStatsSchema>
