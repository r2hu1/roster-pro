import { z } from "zod"

export const UpdateOrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  logo: z.string().nullable().optional(),
  variant: z.enum(["half", "full"]).optional(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().positive().optional(),
  notes: z.string().nullable().optional(),
})

export type UpdateOrderItemDto = z.infer<typeof UpdateOrderItemSchema>
