import { z } from "zod"

export const CreateTableOrderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  variant: z.enum(["half", "full"]),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  notes: z.string().nullable().optional(),
})

export type CreateTableOrderItemDto = z.infer<typeof CreateTableOrderItemSchema>

export const CreateTableOrderSchema = z.object({
  organizationId: z.string(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().email().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  discount: z.number().min(0).optional(),
  items: z
    .array(CreateTableOrderItemSchema)
    .min(1, "At least one item is required"),
  notes: z.string().nullable().optional(),
})

export type CreateTableOrderDto = z.infer<typeof CreateTableOrderSchema>

export const defaultCreateTableOrder: z.input<typeof CreateTableOrderSchema> = {
  organizationId: "",
  items: [],
}
