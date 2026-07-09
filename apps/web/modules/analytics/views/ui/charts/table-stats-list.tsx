"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { TableStat } from "@workspace/shared/schemas/analytics/index"

export function TableStatsList({ stats }: { stats: TableStat[] }) {
  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Table Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No table data in this period</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle>Table Stats</CardTitle>
        <CardDescription>
          Total {stats.length} table{stats.length !== 1 ? "s" : ""} and {stats.reduce((acc, stat) => acc + stat.orderCount, 0)} orders with {stats.reduce((acc, stat) => acc + stat.totalSpent, 0).toLocaleString()}₹ in total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-90 overflow-y-scroll no-scrollbar">
          {stats.map((stat) => (
            <div
              key={stat.tableNumber}
              className="flex bg-muted/50 p-3 rounded-md items-center justify-between gap-4"
            >
              <span className="text-sm font-medium">
                Table {stat.tableNumber}
              </span>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-muted-foreground text-xs">
                  {stat.orderCount} {stat.orderCount === 1 ? "order" : "orders"}
                </span>
                <span className="text-xs tabular-nums font-medium">
                  ₹{stat.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
