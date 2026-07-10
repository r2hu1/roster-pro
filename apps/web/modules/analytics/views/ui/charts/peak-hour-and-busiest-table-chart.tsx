"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { HourlyData } from "@workspace/shared/schemas/analytics/index"

export function PeakHourBusiestTableChart({
  hourlyData,
  peakHour,
  busiestTable,
}: {
  hourlyData: HourlyData[]
  peakHour: number | null
  busiestTable: string | null
}) {
  const chartData = hourlyData.map((h) => ({
    hour: `${h.hour}:00`,
    orders: h.orderCount,
    revenue: h.revenue,
  }))

  return (
    <Card className="pt-0 pb-0!">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Peak Hours & Busiest Table</CardTitle>
          <CardDescription>
            {peakHour != null
              ? `Peak hour at ${peakHour}:00 with ${hourlyData[peakHour]?.orderCount ?? 0} orders`
              : "No order data available"}
            {busiestTable ? ` · Busiest table: ${busiestTable}` : ""}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4!">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={3}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const hourNum = Number.parseInt(label as string)
                  const barColor =
                    hourNum === peakHour ? "var(--chart-2)" : "var(--chart-4)"
                  return (
                    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium">{label}</p>
                      {payload.map((entry) => (
                        <div
                          key={entry.dataKey as string}
                          className="mt-1 flex items-center gap-2"
                        >
                          <span
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: barColor }}
                          />
                          <span className="text-muted-foreground">
                            {entry.name}
                          </span>
                          <span className="font-mono tabular-nums text-foreground">
                            {Number(entry.value).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
              <Legend
                content={({ payload }) => {
                  if (!payload?.length) return null
                  return (
                    <div className="flex items-center justify-center gap-4 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--chart-4)" }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Peak Hour
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--chart-2)" }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Other Hours
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="orders" radius={[4, 4, 0, 0]} name="Orders">
                {chartData.map((entry) => {
                  const hourNum = Number.parseInt(entry.hour)
                  return (
                    <Cell
                      key={entry.hour}
                      fill={
                        hourNum === peakHour
                          ? "var(--chart-4)"
                          : "var(--chart-2)"
                      }
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
