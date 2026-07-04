import { z } from "zod"
import { OrderItemSchema } from "./base.js"

export const OrderItemResponseSchema = OrderItemSchema

export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>

export const OrderItemListResponseSchema = z.array(OrderItemSchema)

export type OrderItemListResponse = z.infer<typeof OrderItemListResponseSchema>
