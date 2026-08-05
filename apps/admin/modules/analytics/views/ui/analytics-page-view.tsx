"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import api from "@/lib/axios"
import type { AnalyticsResponse } from "@workspace/shared/schemas/analytics/index"

import PageHeader from "@/components/page-header"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { OrdersRevenueChart } from "./charts/orders-revenue-chart"
import { HourlyRevenuePieChart } from "./charts/hourly-revenue-pie-chart"
import { PeakHourBusiestTableChart } from "./charts/peak-hour-and-busiest-table-chart"
import { TopItemsList } from "./charts/top-items-list"
import { TableStatsList } from "./charts/table-stats-list"

import { IconCalendar } from "@tabler/icons-react"

const MIN_RANGE_DAYS = 7

function toDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function formatDateRange(from: Date, to: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
  return `${from.toLocaleDateString("en-US", opts)} - ${to.toLocaleDateString("en-US", opts)}`
}

function useAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ["analytics", from, to],
    queryFn: async () => {
      const req = await api.get("/organization/analytics", {
        params: { from, to },
      })
      return req.data.data as AnalyticsResponse
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function AnalyticsPageView() {
  const today = React.useMemo(() => startOfDay(new Date()), [])
  const defaultFrom = React.useMemo(() => addDays(today, -6), [today])

  const [from, setFrom] = React.useState(defaultFrom)
  const [to, setTo] = React.useState(today)
  const [open, setOpen] = React.useState(false)

  const [pendingRange, setPendingRange] = React.useState<{
    from: Date
    to: Date
  }>({ from: defaultFrom, to: today })

  const fromStr = toDateString(from)
  const toStr = toDateString(to)

  const { data, isPending, isError, error, isFetching } = useAnalytics(
    fromStr,
    toStr
  )

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) return

    if (range.to) {
      let start = startOfDay(range.from)
      let end = startOfDay(range.to)

      if (end > today) {
        end = today
      }

      setPendingRange({ from: start, to: end })
    }
  }

  const handleApply = () => {
    setFrom(pendingRange.from)
    setTo(pendingRange.to)
    setOpen(false)
  }

  const hasChanges =
    pendingRange.from.getTime() !== from.getTime() ||
    pendingRange.to.getTime() !== to.getTime()
  const isSingleDate = pendingRange.from.getTime() === pendingRange.to.getTime()

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Watch how your restaurant is performing."
        actions={
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button disabled={isFetching}>
                  <IconCalendar className="size-4" />
                  <span className="flex sm:hidden">Filter</span>
                  <span className="hidden sm:flex">
                    {formatDateRange(from, to)}
                  </span>
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col gap-3 p-3">
                <Calendar
                  mode="range"
                  selected={{ from: pendingRange.from, to: pendingRange.to }}
                  onSelect={handleSelect}
                  numberOfMonths={1}
                  defaultMonth={pendingRange.from}
                />
                <Button
                  onClick={handleApply}
                  disabled={!hasChanges || isSingleDate}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        }
      />

      {isPending && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[320px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[280px] rounded-2xl" />
            <Skeleton className="h-[280px] rounded-2xl" />
          </div>
        </div>
      )}

      {isError && (
        <Card>
          <CardHeader>
            <CardTitle>Failed to load analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {(error as Error)?.message ?? "An unexpected error occurred"}
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">
                  {data.summary.totalOrders.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">
                  ₹{data.summary.totalRevenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
                  Avg Orders / Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">
                  {data.summary.averageOrdersPerTable}
                </p>
              </CardContent>
            </Card>
          </div>

          <OrdersRevenueChart
            chartData={data.revenue.daily}
            timeRange={formatDateRange(from, to)}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PeakHourBusiestTableChart
              hourlyData={data.revenue.hourly}
              peakHour={data.summary.peakHour}
              busiestTable={data.summary.busiestTable}
            />
            <HourlyRevenuePieChart hourlyData={data.revenue.hourly} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TopItemsList items={data.topItems} />
            <TableStatsList stats={data.tableStats} />
          </div>
        </div>
      )}
    </div>
  )
}
