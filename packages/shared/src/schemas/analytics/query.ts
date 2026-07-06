import { z } from "zod"

export const AnalyticsQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
})

export type AnalyticsQueryDto = z.infer<typeof AnalyticsQuerySchema>
