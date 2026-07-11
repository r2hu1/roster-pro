import { and, eq, gte, lt, sql, count } from "drizzle-orm"
import { db } from "../../../core/db/client.js"
import { order } from "../../../core/db/schemas/order.js"
import { tableSchema } from "../../../core/db/schemas/table.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import { EventEmitter } from "node:events"
import type {
  AnalyticsQueryDto,
  AnalyticsResponse,
  HourlyData,
  DailyData,
  TopItem,
  TableStat,
  StatusBreakdown,
  PaymentBreakdown,
} from "@workspace/shared/schemas/analytics/index"

export const analyticsEmitter = new EventEmitter()
analyticsEmitter.setMaxListeners(100)

type AnalyticsUpdatedEvent = {
  type: "updated"
  data: AnalyticsResponse
}

export type AnalyticsEvent = AnalyticsUpdatedEvent

function emptyAnalytics(): AnalyticsResponse {
  return {
    summary: {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      averageOrdersPerTable: 0,
      totalDiscount: 0,
      totalTax: 0,
      cancelledOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      averageItemsPerOrder: 0,
      peakHour: null,
      busiestTable: null,
    },
    revenue: {
      daily: [],
      hourly: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        orderCount: 0,
        revenue: 0,
      })),
    },
    orders: {
      byStatus: [],
      byPaymentMethod: [],
      byPaymentStatus: [],
    },
    topItems: [],
    tableStats: [],
  }
}

export const analyticsLogic = {
  get: async (organizationId: string, query: AnalyticsQueryDto) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Organization not found",
      }
    }

    try {
      const fromDate = new Date(query.from)
      const toDate = new Date(query.to)
      toDate.setDate(toDate.getDate() + 1)

      const orders = await db
        .select()
        .from(order)
        .where(
          and(
            eq(order.organizationId, organizationId),
            gte(order.createdAt, fromDate),
            lt(order.createdAt, toDate)
          )
        )

      if (orders.length === 0) {
        return {
          status: "success",
          code: HTTP_STATUS_CODES.OK,
          data: emptyAnalytics(),
        }
      }

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0)
      const averageOrderValue =
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
      const totalDiscount = orders.reduce((sum, o) => sum + o.discount, 0)
      const totalTax = orders.reduce(
        (sum, o) => sum + o.cgstAmount + o.sgstAmount + o.igstAmount,
        0
      )
      const totalItems = orders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0
      )
      const averageItemsPerOrder =
        totalOrders > 0 ? Math.round((totalItems / totalOrders) * 10) / 10 : 0

      const completedOrders = orders.filter(
        (o) => o.status === "completed"
      ).length
      const cancelledOrders = orders.filter(
        (o) => o.status === "cancelled"
      ).length
      const pendingOrders = orders.filter((o) => o.status === "pending").length

      const hourlyMap = new Map<
        number,
        { orderCount: number; revenue: number }
      >()
      for (let h = 0; h < 24; h++) {
        hourlyMap.set(h, { orderCount: 0, revenue: 0 })
      }
      for (const o of orders) {
        const hour = new Date(o.createdAt).getHours()
        const entry = hourlyMap.get(hour) ?? { orderCount: 0, revenue: 0 }
        entry.orderCount++
        entry.revenue += o.grandTotal
        hourlyMap.set(hour, entry)
      }
      const hourly: HourlyData[] = Array.from(hourlyMap.entries()).map(
        ([hour, data]) => ({
          hour,
          ...data,
        })
      )
      const peakHour =
        hourly.reduce(
          (max, h) => (h.orderCount > (max?.orderCount ?? 0) ? h : max),
          hourly[0]
        )?.hour ?? null

      const dailyMap = new Map<
        string,
        { orderCount: number; revenue: number }
      >()
      for (const o of orders) {
        const dateKey = new Date(o.createdAt).toISOString().split("T")[0]
        const entry = dailyMap.get(dateKey) ?? { orderCount: 0, revenue: 0 }
        entry.orderCount++
        entry.revenue += o.grandTotal
        dailyMap.set(dateKey, entry)
      }
      const daily: DailyData[] = []
      const cursor = new Date(fromDate)
      while (cursor < toDate) {
        const dateKey = cursor.toISOString().split("T")[0]
        const entry = dailyMap.get(dateKey) ?? {
          orderCount: 0,
          revenue: 0,
        }
        daily.push({ date: dateKey, ...entry })
        cursor.setDate(cursor.getDate() + 1)
      }

      const statusMap = new Map<string, number>()
      for (const o of orders) {
        statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1)
      }
      const byStatus: StatusBreakdown[] = Array.from(statusMap.entries()).map(
        ([status, count]) => ({ status, count })
      )

      const paymentStatusMap = new Map<string, number>()
      for (const o of orders) {
        paymentStatusMap.set(
          o.paymentStatus,
          (paymentStatusMap.get(o.paymentStatus) ?? 0) + 1
        )
      }
      const byPaymentStatus: StatusBreakdown[] = Array.from(
        paymentStatusMap.entries()
      ).map(([status, count]) => ({ status, count }))

      const paymentMethodMap = new Map<
        string,
        { count: number; total: number }
      >()
      for (const o of orders) {
        const method = o.paymentMethod ?? "unknown"
        const entry = paymentMethodMap.get(method) ?? { count: 0, total: 0 }
        entry.count++
        entry.total += o.grandTotal
        paymentMethodMap.set(method, entry)
      }
      const byPaymentMethod: PaymentBreakdown[] = Array.from(
        paymentMethodMap.entries()
      ).map(([method, data]) => ({ method, ...data }))

      const itemMap = new Map<
        string,
        { name: string; quantity: number; revenue: number }
      >()
      for (const o of orders) {
        for (const item of o.items) {
          const existing = itemMap.get(item.menuItemId) ?? {
            name: item.name,
            quantity: 0,
            revenue: 0,
          }
          existing.quantity += item.quantity
          existing.revenue += item.quantity * item.unitPrice
          itemMap.set(item.menuItemId, existing)
        }
      }
      const topItems: TopItem[] = Array.from(itemMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      const tableMap = new Map<
        string,
        { orderCount: number; totalSpent: number }
      >()
      for (const o of orders) {
        const entry = tableMap.get(o.tableNumber) ?? {
          orderCount: 0,
          totalSpent: 0,
        }
        entry.orderCount++
        entry.totalSpent += o.grandTotal
        tableMap.set(o.tableNumber, entry)
      }

      const totalTables = await db
        .select({ count: count() })
        .from(tableSchema)
        .where(eq(tableSchema.organizationId, organizationId))

      const numTables = totalTables[0]?.count ?? 1
      const averageOrdersPerTable =
        numTables > 0 ? Math.round((totalOrders / numTables) * 10) / 10 : 0

      const tableStats: TableStat[] = Array.from(tableMap.entries())
        .map(([tableNumber, data]) => ({ tableNumber, ...data }))
        .sort((a, b) => b.orderCount - a.orderCount)

      const busiestTable =
        tableStats.length > 0 ? tableStats[0].tableNumber : null

      const analyticsData: AnalyticsResponse = {
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          averageOrdersPerTable,
          totalDiscount,
          totalTax,
          cancelledOrders,
          completedOrders,
          pendingOrders,
          averageItemsPerOrder,
          peakHour,
          busiestTable,
        },
        revenue: {
          daily,
          hourly,
        },
        orders: {
          byStatus,
          byPaymentMethod,
          byPaymentStatus,
        },
        topItems,
        tableStats,
      }

      return {
        status: "success",
        code: HTTP_STATUS_CODES.OK,
        data: analyticsData,
      }
    } catch (err) {
      console.error("Failed to compute analytics", err)
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to compute analytics",
      }
    }
  },
}
