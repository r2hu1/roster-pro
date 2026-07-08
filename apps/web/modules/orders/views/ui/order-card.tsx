import { cn } from "@workspace/ui/lib/utils"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { UtensilsCrossed } from "lucide-react"
import { statusDotStyles, statusTextStyles, paymentStyles } from "./orders-constants"
import OrdersInfo from "./orders-info"

export function OrderCard({ order }: { order: OrderResponse }) {
  const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <OrdersInfo order={order}>
      <div
        className={cn(
          "group relative rounded-2xl border bg-background p-5",
          "transition-all duration-200",
          "hover:border-foreground/20 hover:bg-muted/20",
          "cursor-pointer"
        )}
      >
        <div className="flex items-start justify-between">
          {/* Icon chip + table */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <UtensilsCrossed className="size-5 text-foreground/70" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">
                Table {order.tableNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Status as dot + label, not a heavy badge */}
          <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1">
            <span
              className={cn("size-1.5 rounded-full", statusDotStyles[order.status])}
            />
            <span
              className={cn(
                "text-xs font-medium",
                statusTextStyles[order.status]
              )}
            >
              {order.status}
            </span>
          </div>
        </div>

        {order.customerName && (
          <p className="mt-3 truncate text-sm text-muted-foreground">
            {order.customerName}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <p className="font-mono text-2xl font-semibold tracking-tight">
            <span className="mr-0.5 text-sm font-normal text-muted-foreground">
              ₹
            </span>
            {order.grandTotal.toLocaleString("en-IN")}
          </p>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 && "s"}
            </p>
            <p className="text-xs text-muted-foreground/70">{time}</p>
          </div>
        </div>

        {/* Payment status as bottom strip, subtle */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span
            className={cn("text-xs font-medium", paymentStyles[order.paymentStatus])}
          >
            {order.paymentStatus}
          </span>
          {order.discount > 0 && (
            <span className="text-xs text-muted-foreground">
              −₹{order.discount.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </OrdersInfo>
  )
}
