"use client"

import { memo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import type { OrderSchema } from "@workspace/shared/schemas/order/index"
import type { z } from "zod"
import {
  statusStyles,
  statusDotStyles,
  statusTextStyles,
} from "./orders-constants"
import { OrderItemsList } from "./order-items-list"
import { OrderTotalsSummary } from "./order-totals-summary"
import { OrderStatusSelect } from "./order-status-controls"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from "@workspace/ui/components/responsive-modal"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Printer } from "reicon-react"
import { isParcelOrder } from "@workspace/shared/constants/index"
import PrintReceiptVersionModal from "./print-recipts-version-responsive-modal"
import { updateOrder } from "../../api/orders"
import { OrderStatus } from "@workspace/shared/enums"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"

const statusConfig: Partial<
  Record<OrderStatus, { label: string; next: OrderStatus }>
> = {
  pending: {
    label: "Preparing",
    next: "preparing",
  },
  confirmed: {
    label: "Preparing",
    next: "preparing",
  },
  preparing: {
    label: "Ready",
    next: "ready",
  },
  ready: {
    label: "Served",
    next: "served",
  },
}

type Order = z.infer<typeof OrderSchema>

function NextStatusButton({
  status,
  orderId,
}: {
  status: OrderStatus
  orderId: string
}) {
  const [loading, setLoading] = useState(false)
  const config = statusConfig[status]
  if (!config) return null

  return (
    <div className="px-2 pb-2">
      <Button
        className="w-full border-border! rounded-sm"
        disabled={loading}
        size="sm"
        variant="secondary"
        onClick={async (e) => {
          e.stopPropagation()
          setLoading(true)
          try {
            await updateOrder({ id: orderId, status: config.next })
          } catch {
            toast.error("Failed to update status")
          } finally {
            setLoading(false)
          }
        }}
      >
        {loading ? (
          <>
            Updating
            <Loader />
        </>
        ) : `Mark ${config.label}`}
      </Button>
    </div>
  )
}

export const KitchenOrderCard = memo(function KitchenOrderCard({
  order,
  status,
  multiRound = false,
}: {
  order: Order
  status?: string
  multiRound?: boolean
}) {
  const [open, setOpen] = useState(false)
  const time = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const itemsSummary = order.items.slice(0, 1)
  const remainingCount = order.items.length - 1

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>
        <div className="group flex h-full flex-col overflow-hidden rounded-lg border bg-background cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm">

          <div className="flex-1 space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold leading-tight">
                  {isParcelOrder(order.tableNumber)
                    ? "Parcel"
                    : `Table ${order.tableNumber}`}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {order.invoiceNumber}
                </p>
              </div>
              <div
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5",
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
                    "text-[11px] capitalize"
                  )}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {order.customerName && (
              <p className="truncate text-sm text-muted-foreground">
                {order.customerName}
              </p>
            )}

            <div className="space-y-1.5 border-t border-dashed pt-3">
              {itemsSummary.map((item, i) => (
                <div key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="shrink-0 tabular-nums font-medium">
                    {item.quantity}×
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    ₹{item.quantity * item.unitPrice}
                  </span>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="pt-0.5 text-xs font-medium text-muted-foreground">
                  +{remainingCount} more item{remainingCount > 1 && "s"}
                </p>
              )}
            </div>

            {order.notes && (
              <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                {order.notes}
              </p>
            )}
          </div>


          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5">
            <p className="text-xs text-muted-foreground">{time}</p>
            <p className="font-mono text-base font-semibold">
              ₹{order.grandTotal}
            </p>
          </div>
          <NextStatusButton status={order.status} orderId={order.id} />
        </div>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent thumbClassName="mt-1">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <span className="text-muted-foreground font-normal">
              {isParcelOrder(order.tableNumber) ? "Parcel" : `Table ${order.tableNumber}`}
            </span>
            <span className="font-mono text-sm">{order.invoiceNumber}</span>
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <ScrollArea className="max-h-[70vh]">
          <ResponsiveModalBody>
            <div className="space-y-5 pt-4">
              {order.status !=="served" && order.status !== "completed" && (
                <OrderStatusSelect orderId={order.id} initial={order.status} excludeCompleted />
              )}

              {order.notes && (
                <div className="rounded-lg border-2 p-2.5">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Notes
                  </p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}

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
          </ResponsiveModalBody>
        </ScrollArea>

        <ResponsiveModalFooter className="border-t pt-4">
          <div className="grid gap-2 w-full">
            <p className="text-xs text-center text-muted-foreground">
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
                Print Receipt
              </Button>
            </PrintReceiptVersionModal>
          </div>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
})
