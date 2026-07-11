import { z } from "zod"

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  menuItemId: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  variant: z.enum(["half", "full"]),
  quantity: z.number(),
  unitPrice: z.number(),
  notes: z.string().nullable(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>
