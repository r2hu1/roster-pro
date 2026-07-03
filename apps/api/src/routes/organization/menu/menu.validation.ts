import { z } from "zod"

export const createMenuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const updateMenuSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const createMenuItemSchema = z.object({
  menuId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.string()).nullable().optional(),
  price: z.number().int().positive("Price must be positive"),
  category: z.string().nullable().optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  preparationTime: z.number().int().positive().nullable().optional(),
})

export const updateMenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.string()).nullable().optional(),
  price: z.number().int().positive().optional(),
  category: z.string().nullable().optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  preparationTime: z.number().int().positive().nullable().optional(),
})
