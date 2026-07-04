import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../enums/index.js"
import { MenuItemSchema } from "../menu/menu-item/base.js"

export const OrderSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable(),
  tableNumber: z.string(),
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  items: z.array(MenuItemSchema).nullable(),
  totalAmount: z.number(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Order = z.infer<typeof OrderSchema>

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  menuItemId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  notes: z.string().nullable(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>
