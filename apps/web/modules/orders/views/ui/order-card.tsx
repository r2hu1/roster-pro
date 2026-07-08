import { cn } from "@workspace/ui/lib/utils"
import type { OrderSchema } from "@workspace/shared/schemas/order/index"
import type { z } from "zod"
import {
  statusDotStyles,
  statusTextStyles,
  paymentStyles,
} from "./orders-constants"
import OrdersInfo from "./orders-info"

type Order = z.infer<typeof OrderSchema>

export function OrderCard({ order }: { order: Order }) {
  const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <OrdersInfo order={order}>
      <div
        className={cn(
          "group relative rounded-lg border hover:shadow-sm bg-background p-4",
          "transition-all duration-200",
          "cursor-pointer"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold leading-tight">
              Table {order.tableNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.invoiceNumber}
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border px-2 py-1">
            <span
              className={cn(
                "size-1.5 rounded-full",
                statusDotStyles[order.status]
              )}
            />
            <span
              className={cn(
                "text-xs font-medium capitalize",
                statusTextStyles[order.status]
              )}
            >
              {order.status}
            </span>
          </div>
        </div>

        {order.customerName && (
          <p className="mt-2 truncate text-sm text-muted-foreground">
            {order.customerName}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 && "s"}
            </p>
            <p className="text-xs text-muted-foreground/70">{time}</p>
          </div>
          <p className="font-mono text-lg font-semibold tracking-tight">
            <span className="mr-0.5 text-sm font-normal text-muted-foreground">
              ₹
            </span>
            {order.grandTotal}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-2.5">
          <span className={cn("text-xs font-medium")}>
            {new Date(order.createdAt).toDateString()}
          </span>
          {order.discount > 0 && (
            <span className="text-xs text-muted-foreground">
              −₹{order.discount}
            </span>
          )}
        </div>
      </div>
    </OrdersInfo>
  )
}
