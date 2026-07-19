import { z } from "zod"

export const UpdateMenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.string()).nullable().optional(),
  price: z
    .object({
      half: z.number().positive("Half price must be positive"),
      full: z.number().positive("Full price must be positive"),
    })
    .optional(),
  image: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  preparationTime: z.number().positive().nullable().optional(),
})

export type UpdateMenuItemDto = z.infer<typeof UpdateMenuItemSchema>

export const DeleteMenuItemSchema = z.object({
  id: z.string(),
})

export type DeleteMenuItemDto = z.infer<typeof DeleteMenuItemSchema>
