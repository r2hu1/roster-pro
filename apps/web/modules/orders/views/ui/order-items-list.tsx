import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

const inr = (n: number) => n.toLocaleString("en-IN")

export function OrderItemsList({ items }: { items: OrderResponse["items"] }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
        Items ({items.length})
      </p>
      <div className="space-y-0.5 bg-muted/30 p-0.5 rounded-lg px-3.5!">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 border-b last:border-0"
          >
            <div className="min-w-0 pr-4">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.quantity} × ₹{inr(item.unitPrice)}
              </p>
            </div>
            <p className="text-sm font-medium tabular-nums whitespace-nowrap">
              ₹{inr(item.quantity * item.unitPrice)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
