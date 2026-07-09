import { cn } from "@workspace/ui/lib/utils"
import type { OrderSchema } from "@workspace/shared/schemas/order/index"
import type { z } from "zod"
import {
  statusDotStyles,
  statusTextStyles,
  paymentStyles,
  statusStyles,
} from "./orders-constants"
import OrdersInfo from "./orders-info"
import { IconInfoCircle } from "@tabler/icons-react"

type Order = z.infer<typeof OrderSchema>

export function OrderCard({ order }: { order: Order }) {
  const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <OrdersInfo order={order}>
      <div className="rounded-lg border hover:shadow-sm bg-background">
        <div
          className={cn(
            "group relative p-4",
            "transition-all duration-200",
            "cursor-pointer"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold leading-tight">
                Table {order.tableNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.invoiceNumber}
              </p>
            </div>

            <IconInfoCircle className="size-4 text-muted-foreground transition opacity-0 group-hover:opacity-100"/>
          </div>

          {order.customerName && (
            <p className="mt-2 truncate text-sm text-muted-foreground">
              {order.customerName}
            </p>
          )}

          <div className="mt-3 flex items-end bg-muted/40 p-2 rounded-md justify-between">
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
        </div>
        <div className="flex items-center justify-between bg-muted/40 border-t p-2.5">
          <span className={cn("text-xs")}>
            {new Date(order.createdAt).toDateString()}
          </span>
          {/*{order.discount > 0 && (
            <span className="text-xs text-muted-foreground">
              −₹{order.discount}
            </span>
          )}*/}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2 py-0.5",
              statusStyles[order.status]
            )}
          >
            <span
              className={cn(
                "size-1 rounded-full",
                statusDotStyles[order.status]
              )}
            />
            <span
              className={cn(
                statusTextStyles[order.status],
                "text-[10px] capitalize"
              )}
            >
              {order.status}
            </span>
          </div>
        </div>
      </div>
    </OrdersInfo>
  )
}
