"use client"

import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import { OrderStatusSelect, PaymentStatusSelect } from "./order-status-controls"
import { OrderItemsList } from "./order-items-list"
import { OrderTotalsSummary } from "./order-totals-summary"
import { PrintReceiptButton } from "@/modules/receipts/views/ui/print-receipt-button"

export default function OrdersInfo({
  order,
  children,
}: {
  order: OrderResponse
  children: React.ReactNode
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-normal">
              Order
            </span>
            <span className="font-mono">{order.invoiceNumber}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 p-4 pt-0">
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <span className="text-muted-foreground font-medium text-sm">
                Table Number
              </span>
              <span className="text-3xl font-semibold">
                {order.tableNumber}
              </span>
            </div>
            <OrderStatusSelect orderId={order.id} initial={order.status} />
            <PaymentStatusSelect
              orderId={order.id}
              initial={order.paymentStatus}
            />
          </div>

          {(order.customerName || order.customerPhone) && (
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                Customer
              </p>
              {order.customerName && (
                <p className="text-sm font-medium">{order.customerName}</p>
              )}
              {order.customerPhone && (
                <p className="text-sm text-muted-foreground">
                  {order.customerPhone}
                </p>
              )}
            </div>
          )}

          <OrderItemsList items={order.items} />
          <OrderTotalsSummary order={order} />

          {order.notes && (
            <div className="rounded-lg border p-3.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                Notes
              </p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="grid gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <PrintReceiptButton
              orderId={order.id}
              size="lg"
              variant="default"
            />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
