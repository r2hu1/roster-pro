import { z } from "zod"

export const CreateMenuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type CreateMenuDto = z.infer<typeof CreateMenuSchema>

export const defaultCreateMenu: z.input<typeof CreateMenuSchema> = {
  name: "",
}
