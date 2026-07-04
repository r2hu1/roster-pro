import { z } from "zod"

export const CreateMenuItemSchema = z.object({
  menuId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.string()).nullable().optional(),
  price: z.number().positive("Price must be positive"),
  image: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  preparationTime: z.number().positive().nullable().optional(),
})

export type CreateMenuItemDto = z.infer<typeof CreateMenuItemSchema>

export const defaultCreateMenuItem: z.input<typeof CreateMenuItemSchema> = {
  menuId: "",
  name: "",
  price: 0,
}
