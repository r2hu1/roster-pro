import { z } from "zod"

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(1, "Comment is required"),
  organizationId: z.string(),
  orderId: z.string(),
})

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>

export const defaultCreateReview: z.input<typeof CreateReviewSchema> = {
  rating: 5,
  comment: "",
  organizationId: "",
  orderId: "",
}
