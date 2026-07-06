import { z } from "zod"

export const HourlyDataSchema = z.object({
  hour: z.number(),
  orderCount: z.number(),
  revenue: z.number(),
})

export type HourlyData = z.infer<typeof HourlyDataSchema>

export const DailyDataSchema = z.object({
  date: z.string(),
  orderCount: z.number(),
  revenue: z.number(),
})

export type DailyData = z.infer<typeof DailyDataSchema>

export const TopItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  revenue: z.number(),
})

export type TopItem = z.infer<typeof TopItemSchema>

export const TableStatSchema = z.object({
  tableNumber: z.string(),
  orderCount: z.number(),
  totalSpent: z.number(),
})

export type TableStat = z.infer<typeof TableStatSchema>

export const StatusBreakdownSchema = z.object({
  status: z.string(),
  count: z.number(),
})

export type StatusBreakdown = z.infer<typeof StatusBreakdownSchema>

export const PaymentBreakdownSchema = z.object({
  method: z.string(),
  count: z.number(),
  total: z.number(),
})

export type PaymentBreakdown = z.infer<typeof PaymentBreakdownSchema>

export const AnalyticsResponseSchema = z.object({
  summary: z.object({
    totalOrders: z.number(),
    totalRevenue: z.number(),
    averageOrderValue: z.number(),
    averageOrdersPerTable: z.number(),
    totalDiscount: z.number(),
    totalTax: z.number(),
    cancelledOrders: z.number(),
    completedOrders: z.number(),
    pendingOrders: z.number(),
    averageItemsPerOrder: z.number(),
    peakHour: z.number().nullable(),
    busiestTable: z.string().nullable(),
  }),
  revenue: z.object({
    daily: z.array(DailyDataSchema),
    hourly: z.array(HourlyDataSchema),
  }),
  orders: z.object({
    byStatus: z.array(StatusBreakdownSchema),
    byPaymentMethod: z.array(PaymentBreakdownSchema),
    byPaymentStatus: z.array(StatusBreakdownSchema),
  }),
  topItems: z.array(TopItemSchema),
  tableStats: z.array(TableStatSchema),
})

export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>
