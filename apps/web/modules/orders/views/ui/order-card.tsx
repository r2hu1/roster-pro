import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { statusStyles, paymentStyles } from "./orders-constants"

export function OrderCard({ order }: { order: OrderResponse }) {
  return (
    <div className="bg-background space-y-2 border rounded-lg p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={statusStyles[order.status]}>
          {order.status}
        </Badge>
        <span
          className={cn(
            "text-sm font-medium",
            paymentStyles[order.paymentStatus]
          )}
        >
          {order.paymentStatus}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">{order.invoiceNumber}</h3>
        <h3 className="text-xl font-medium">{order.tableNumber}</h3>
      </div>
      <div className="flex items-center justify-between">
        <p>₹{order.grandTotal}</p>
        <p className="text-sm text-muted-foreground">
          {order.items.length} item{order.items.length !== 1 && "s"}
        </p>
      </div>
    </div>
  )
}
