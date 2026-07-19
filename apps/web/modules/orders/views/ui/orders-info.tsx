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
import PrintReceiptVersionModal from "./print-recipts-version-responsive-modal"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { isParcelOrder } from "@workspace/shared/constants/index"
import { Printer } from "reicon-react"

export default function OrdersInfo({
  order,
  multiRound = false,
  children,
}: {
  order: OrderResponse
  multiRound?: boolean
  children: React.ReactNode
}) {
  const showSession = Boolean(order.tableSessionId) && multiRound
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md!">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-normal">
              Order
            </span>
            <span className="font-mono text-sm">{order.invoiceNumber}</span>
            {showSession && (
              <span className="ml-auto mr-6 text-xs font-medium text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Session
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="overflow-y-scroll">
          <div className="flex-1 space-y-5 p-4 pt-0">
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <span className="text-muted-foreground font-medium text-sm">
                  {isParcelOrder(order.tableNumber)
                    ? "Order Type"
                    : "Table Number"}
                </span>
                <span className="text-3xl font-semibold">
                  {isParcelOrder(order.tableNumber)
                    ? "Parcel"
                    : order.tableNumber}
                </span>
              </div>
              {showSession && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="size-4 text-amber-600 dark:text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                      />
                    </svg>
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Multi-round session
                    </span>
                  </div>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/70">
                    This order is part of a multi-round session at Table{" "}
                    {order.tableNumber}. Print the consolidated receipt to
                    include all rounds.
                  </p>
                </div>
              )}
              <OrderStatusSelect orderId={order.id} initial={order.status} />
              <PaymentStatusSelect
                orderId={order.id}
                initial={order.paymentStatus}
              />
              {order.notes && (
                <div className="rounded-lg border-2 p-2.5">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Notes
                  </p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
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
          </div>
        </ScrollArea>

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
            <PrintReceiptVersionModal
              orderId={order.id}
              sessionId={multiRound ? order.tableSessionId : null}
            >
              <Button size="lg" variant="default" className="w-full">
                <Printer />
                Print
              </Button>
            </PrintReceiptVersionModal>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
