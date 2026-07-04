import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../enums/index.js"
import { MenuItemSchema } from "../menu/menu-item/base.js"

export const CreateOrderSchema = z.object({
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().email().nullable().optional(),
  tableNumber: z.string().min(1, "Table number is required"),
  status: OrderStatus.optional(),
  paymentStatus: PaymentStatus.optional(),
  items: z.array(MenuItemSchema).nullable().optional(),
  totalAmount: z.number().positive("Total amount must be positive"),
  notes: z.string().nullable().optional(),
})

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>

export const defaultCreateOrder: z.input<typeof CreateOrderSchema> = {
  tableNumber: "",
  totalAmount: 0,
}
