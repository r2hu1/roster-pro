import { z } from "zod"
import { ReviewSchema } from "./base.js"

export const ReviewResponseSchema = ReviewSchema

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>

export const ReviewListResponseSchema = z.array(ReviewSchema)

export type ReviewListResponse = z.infer<typeof ReviewListResponseSchema>
