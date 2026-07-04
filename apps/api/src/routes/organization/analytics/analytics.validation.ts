import { z } from "zod"

export const analyticsQuerySchema = z
  .object({
    from: z.string().min(1, "'from' is required"),
    to: z.string().min(1, "'to' is required"),
  })
  .refine(
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

export type AnalyticsQueryDto = z.infer<typeof analyticsQuerySchema>
