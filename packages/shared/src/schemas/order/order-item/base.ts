import { z } from "zod"

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  menuItemId: z.string(),
  variant: z.enum(["half", "full"]),
  quantity: z.number(),
  unitPrice: z.number(),
  notes: z.string().nullable(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>
