import { z } from "zod"

export const CreateOrderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  name: z.string().min(1, "Name is required"),
  variant: z.enum(["half", "full"]),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().positive("Unit price must be positive"),
  notes: z.string().nullable().optional(),
})

export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>

export const defaultCreateOrderItem: z.input<typeof CreateOrderItemSchema> = {
  menuItemId: "",
  name: "",
  variant: "full",
  quantity: 1,
  unitPrice: 0,
}
