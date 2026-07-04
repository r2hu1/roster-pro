import { z } from "zod"

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
  orderId: z.string().optional(),
  organizationId: z.string().optional(),
})

export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>
