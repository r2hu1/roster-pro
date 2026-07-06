"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { TopItem } from "@workspace/shared/schemas/analytics/index"

export function TopItemsList({ items }: { items: TopItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No items ordered in this period
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-muted-foreground text-xs tabular-nums w-4 shrink-0">
                  {i + 1}
                </span>
                <span className="truncate text-sm font-medium">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-muted-foreground text-xs">
                  {item.quantity}x
                </span>
                <span className="text-xs tabular-nums font-medium">
                  ₹{item.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
