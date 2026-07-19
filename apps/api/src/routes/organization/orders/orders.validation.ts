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

export const updateOrderStatusSchema = z.object({
  status: OrderStatus,
})

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>

export {
  CreateTableOrderSchema as createTableOrderSchema,
  type CreateTableOrderDto,
  CancelTableOrderSchema as cancelTableOrderSchema,
  type CancelTableOrderDto,
  UpdateTableOrderSchema as updateTableOrderSchema,
  type UpdateTableOrderDto,
} from "@workspace/shared/schemas/order/index"

export {
  CreateOrderItemSchema as createOrderItemSchema,
  UpdateOrderItemSchema as updateOrderItemSchema,
  type CreateOrderItemDto,
  type UpdateOrderItemDto,
} from "@workspace/shared/schemas/order/order-item/index"
