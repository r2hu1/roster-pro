"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { DailyData } from "@workspace/shared/schemas/analytics/index"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function OrdersRevenueChart({
  chartData,
  timeRange,
}: {
  chartData: DailyData[]
  timeRange: string
}) {
  const data = chartData.map((d) => ({
    date: d.date,
    orders: d.orderCount,
    revenue: d.revenue,
  }))

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Orders & Revenue</CardTitle>
          <CardDescription>
            Showing total orders and revenue for {timeRange}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: number) => v.toLocaleString()}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: number) => `\u20B9${v.toLocaleString()}`}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="mb-1.5 font-medium">
                        {formatDate(label as string)}
                      </p>
                      <div className="space-y-1">
                        {payload.map((entry) => (
                          <div
                            key={entry.dataKey as string}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="size-2 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                              {entry.name}
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              {entry.dataKey === "revenue"
                                ? `\u20B9${Number(entry.value).toLocaleString()}`
                                : Number(entry.value).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="orders"
                fill="url(#fillOrders)"
                stroke="var(--chart-1)"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
                yAxisId="left"
                name="Orders"
              />
              <Bar
                dataKey="revenue"
                fill="url(#fillRevenue)"
                stroke="var(--chart-2)"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
                yAxisId="right"
                name="Revenue"
              />
              <Legend
                content={({ payload }) => {
                  if (!payload?.length) return null
                  return (
                    <div className="flex items-center justify-center gap-4 pt-3">
                      {payload.map((entry) => (
                        <div
                          key={entry.value}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
