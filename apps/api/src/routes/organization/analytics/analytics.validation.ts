import { AnalyticsQuerySchema } from "@workspace/shared/schemas/analytics/index"
import type { AnalyticsQueryDto } from "@workspace/shared/schemas/analytics/index"
export type { AnalyticsQueryDto }

export const analyticsQuerySchema = AnalyticsQuerySchema.refine(
  (data) => {
    const from = new Date(data.from)
    return !Number.isNaN(from.getTime())
  },
  { message: "Invalid 'from' date", path: ["from"] }
)
  .refine(
    (data) => {
      const to = new Date(data.to)
      return !Number.isNaN(to.getTime())
    },
    { message: "Invalid 'to' date", path: ["to"] }
  )
  .refine(
    (data) => {
      const from = new Date(data.from)
      const to = new Date(data.to)
      return from < to
    },
    { message: "'from' must be before 'to'", path: ["from"] }
  )
