import { z } from "zod"

export const ReviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  orderId: z.string(),
  comment: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  organizationId: z.string(),
})

export type Review = z.infer<typeof ReviewSchema>
