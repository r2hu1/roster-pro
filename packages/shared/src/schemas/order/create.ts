import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../enums/index.js"
import { CreateOrderItemSchema } from "./order-item/create.js"

export const CreateOrderSchema = z.object({
  organizationId: z.string(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().email().nullable().optional(),
  tableNumber: z.string().min(1, "Table number is required"),
  tableSessionId: z.string().nullable().optional(),
  status: OrderStatus.optional(),
  paymentStatus: PaymentStatus.optional(),
  paymentMethod: z.string().nullable().optional(),
  items: z.array(CreateOrderItemSchema).optional(),
  subtotal: z.number().positive("Subtotal must be positive"),
  discount: z.number().min(0).optional(),
  taxableAmount: z.number().positive("Taxable amount must be positive"),
  cgstAmount: z.number().min(0).optional(),
  gstRate: z.number().min(0).optional(),
  sgstAmount: z.number().min(0).optional(),
  igstAmount: z.number().min(0).optional(),
  roundOff: z.number().optional(),
  grandTotal: z.number().positive("Grand total must be positive"),
  notes: z.string().nullable().optional(),
})

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>

export const defaultCreateOrder: z.input<typeof CreateOrderSchema> = {
  organizationId: "",
  tableNumber: "",
  subtotal: 0,
  taxableAmount: 0,
  grandTotal: 0,
}
