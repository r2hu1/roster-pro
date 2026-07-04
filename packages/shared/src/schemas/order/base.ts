import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../enums/index.js"
import { OrderItemSchema } from "./order-item/base.js"

export const OrderSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  invoiceNumber: z.string(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable(),
  tableNumber: z.string(),
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  paymentMethod: z.string().nullable(),
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  discount: z.number(),
  taxableAmount: z.number(),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  igstAmount: z.number(),
  roundOff: z.number(),
  grandTotal: z.number(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Order = z.infer<typeof OrderSchema>
