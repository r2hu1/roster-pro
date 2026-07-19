import { z } from "zod"

export const PriceSchema = z.object({
  half: z.number(),
  full: z.number(),
})

export type Price = z.infer<typeof PriceSchema>

export const MenuItemSchema = z.object({
  id: z.string(),
  menuId: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ingredients: z.array(z.string()).nullable(),
  price: PriceSchema,
  image: z.string().nullable(),
  imageKey: z.string().nullable(),
  category: z.string().nullable(),
  isAvailable: z.boolean(),
  isVegetarian: z.boolean(),
  isFeatured: z.boolean(),
  preparationTime: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type MenuItem = z.infer<typeof MenuItemSchema>
