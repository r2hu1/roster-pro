import { z } from "zod"

export const UpdateMenuSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateMenuDto = z.infer<typeof UpdateMenuSchema>

export const DeleteMenuSchema = z.object({
  id: z.string(),
})

export type DeleteMenuDto = z.infer<typeof DeleteMenuSchema>
