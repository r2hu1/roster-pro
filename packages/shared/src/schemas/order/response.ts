import { z } from "zod"
import { OrderSchema } from "./base.js"

export const OrderResponseSchema = OrderSchema

export type OrderResponse = z.infer<typeof OrderResponseSchema>

export const OrderListResponseSchema = z.array(OrderSchema)

export type OrderListResponse = z.infer<typeof OrderListResponseSchema>
