"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
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

  const chartConfig = {
    orders: {
      label: "Orders",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Hours & Busiest Table</CardTitle>
        <CardDescription>
          {peakHour != null
            ? `Peak hour at ${peakHour}:00 with ${hourlyData[peakHour]?.orderCount ?? 0} orders`
            : "No order data available"}
          {busiestTable ? ` · Busiest table: ${busiestTable}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={3}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                const hourNum = Number.parseInt(entry.hour)
                return (
                  <Cell
                    key={index}
                    fill={
                      hourNum === peakHour
                        ? "var(--chart-2)"
                        : "var(--chart-1)"
                    }
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
