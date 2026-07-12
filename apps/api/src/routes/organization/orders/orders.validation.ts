export {
  CreateOrderSchema as createOrderSchema,
  UpdateOrderSchema as updateOrderSchema,
  DeleteOrderSchema as deleteOrderSchema,
  type CreateOrderDto,
  type UpdateOrderDto,
  type DeleteOrderDto,
} from "@workspace/shared/schemas/order/index"

import { z } from "zod"
import { OrderStatus } from "@workspace/shared/enums/index"
import { CreateOrderSchema } from "@workspace/shared/schemas/order/index"
import { CreateOrderItemSchema } from "@workspace/shared/schemas/order/order-item/index"

export const updateOrderStatusSchema = z.object({
  status: OrderStatus,
})

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>

export const createTableOrderSchema = CreateOrderSchema.omit({
  tableNumber: true,
}).extend({
  items: z.array(CreateOrderItemSchema).min(1, "At least one item is required"),
})

export type CreateTableOrderDto = z.infer<typeof createTableOrderSchema>

export {
  CreateOrderItemSchema as createOrderItemSchema,
  UpdateOrderItemSchema as updateOrderItemSchema,
  type CreateOrderItemDto,
  type UpdateOrderItemDto,
} from "@workspace/shared/schemas/order/order-item/index"
