import type { OrderResponse } from "@workspace/shared/schemas/order/index"

const inr = (n: number) => n.toLocaleString("en-IN")

export function OrderTotalsSummary({ order }: { order: OrderResponse }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3.5 space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="tabular-nums">₹{inr(order.subtotal)}</span>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="text-red-500 tabular-nums">
            −₹{inr(order.discount)}
          </span>
        </div>
      )}
      {order.taxableAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxable Amount</span>
          <span className="tabular-nums">₹{inr(order.taxableAmount)}</span>
        </div>
      )}
      {(order.cgstAmount > 0 || order.sgstAmount > 0) && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">CGST & SGST</span>
          <span className="tabular-nums">
            ₹{inr(order.cgstAmount + order.sgstAmount)}
          </span>
        </div>
      )}
      {order.igstAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IGST</span>
          <span className="tabular-nums">₹{inr(order.igstAmount)}</span>
        </div>
      )}
      {order.roundOff !== 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Round Off</span>
          <span className="tabular-nums">₹{inr(order.roundOff)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-sm pt-2 border-t">
        <span>Grand Total</span>
        <span className="tabular-nums">₹{inr(order.grandTotal)}</span>
      </div>
    </div>
  )
}
