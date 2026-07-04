import { z } from "zod"

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  image: z.string().nullable().optional(),
})

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>
