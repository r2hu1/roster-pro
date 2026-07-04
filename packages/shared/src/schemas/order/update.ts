import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../enums/index.js"

export const UpdateOrderSchema = z.object({
  id: z.string(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().email().nullable().optional(),
  tableNumber: z.string().optional(),
  status: OrderStatus.optional(),
  paymentStatus: PaymentStatus.optional(),
  totalAmount: z.number().positive().optional(),
  notes: z.string().nullable().optional(),
})

export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>

export const DeleteOrderSchema = z.object({
  id: z.string(),
})

export type DeleteOrderDto = z.infer<typeof DeleteOrderSchema>
