"use client"

import {
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { HourlyData } from "@workspace/shared/schemas/analytics/index"

type Period = {
  label: string
  hours: number[]
}

const periods: Period[] = [
  { label: "Morning (6-11)", hours: [6, 7, 8, 9, 10, 11] },
  { label: "Afternoon (12-17)", hours: [12, 13, 14, 15, 16, 17] },
  { label: "Evening (18-23)", hours: [18, 19, 20, 21, 22, 23] },
  { label: "Night (0-5)", hours: [0, 1, 2, 3, 4, 5] },
]

const PERIOD_COLORS: Record<string, string> = {
  "Morning (6-11)": "var(--chart-1)",
  "Afternoon (12-17)": "var(--chart-2)",
  "Evening (18-23)": "var(--chart-3)",
  "Night (0-5)": "var(--chart-4)",
}

export function HourlyRevenuePieChart({
  hourlyData,
}: {
  hourlyData: HourlyData[]
}) {
  const data = Array.from({ length: 24 }, (_, h) => {
    const entry = hourlyData.find((d) => d.hour === h)
    const period = periods.find((p) => p.hours.includes(h))
    return {
      name: `${h}:00`,
      value: entry?.revenue ?? 0,
      color: period ? PERIOD_COLORS[period.label] : "var(--chart-4)",
    }
  }).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
          <div className="grid gap-1">
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Revenue by time of day</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No revenue in this period</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid gap-1">
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Revenue by time of day</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                minAngle={5}
                label={({ name, value }) =>
                  value > 0 ? `${name} ₹${value.toLocaleString()}` : ""
                }
                labelLine
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                content={() => (
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2">
                    {periods.map((p) => (
                      <div key={p.label} className="flex items-center gap-1.5">
                        <span
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: PERIOD_COLORS[p.label],
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {p.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const entry = payload[0]
                  if (!entry) return null
                  return (
                    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium">{entry.name}</p>
                      <p className="font-mono tabular-nums text-foreground">
                        ₹{Number(entry.value).toLocaleString()}
                      </p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
