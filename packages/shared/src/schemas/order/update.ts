import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../enums/index.js"
import { CreateOrderItemSchema } from "./order-item/create.js"

export const UpdateOrderSchema = z.object({
  id: z.string(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().email().nullable().optional(),
  tableNumber: z.string().optional(),
  status: OrderStatus.optional(),
  paymentStatus: PaymentStatus.optional(),
  paymentMethod: z.string().nullable().optional(),
  items: z.array(CreateOrderItemSchema).optional(),
  subtotal: z.number().positive().optional(),
  discount: z.number().min(0).optional(),
  taxableAmount: z.number().positive().optional(),
  gstRate: z.number().min(0).optional(),
  cgstAmount: z.number().min(0).optional(),
  sgstAmount: z.number().min(0).optional(),
  igstAmount: z.number().min(0).optional(),
  roundOff: z.number().optional(),
  grandTotal: z.number().positive().optional(),
  notes: z.string().nullable().optional(),
})

export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>

export const DeleteOrderSchema = z.object({
  id: z.string(),
})

export type DeleteOrderDto = z.infer<typeof DeleteOrderSchema>
