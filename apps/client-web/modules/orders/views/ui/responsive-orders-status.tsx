"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { IconClock, IconShoppingBag } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { useTableContext } from "@/modules/providers/table-provider"
import { RippleButton } from "./ripple-button"
import { useActiveOrders } from "@/hooks/use-active-orders"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Loader } from "@workspace/ui/components/loader"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

const statusLabel: Record<
  string,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
  }
> = {
  pending: { label: "Pending", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default" },
  preparing: { label: "Preparing", variant: "default" },
  ready: { label: "Ready", variant: "default" },
  served: { label: "Served", variant: "outline" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

function orderEstimate(order: {
  items: Array<{ preparationTime?: number | null }>
  createdAt: string | Date
}): number {
  const maxPrep = order.items.reduce(
    (max, i) => Math.max(max, i.preparationTime ?? 0),
    0
  )
  if (maxPrep <= 0) return 0
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000
  return Math.max(0, Math.ceil(maxPrep - elapsed))
}

function OrderRoundCard({
  order,
  label,
}: {
  order: OrderResponse
  label: string
}) {
  const est = orderEstimate(order)
  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {est > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <IconClock className="size-3" />
              {est} min
            </span>
          )}
          <Badge
            variant={statusLabel[order.status]?.variant ?? "secondary"}
            className="text-[10px] px-2 py-0"
          >
            {statusLabel[order.status]?.label ?? order.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        {order.items.map((item) => (
          <div
            key={`${item.menuItemId}-${item.variant}`}
            className="flex items-center justify-between text-sm"
          >
            <span className="truncate">
              {item.quantity}× {item.name}
              {item.variant && (
                <span className="text-muted-foreground text-xs ml-1">
                  ({item.variant})
                </span>
              )}
            </span>
            <span className="tabular-nums text-muted-foreground shrink-0 ml-2">
              ₹{item.unitPrice * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          #{order.invoiceNumber} ·{" "}
          {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="font-medium tabular-nums">₹{order.grandTotal}</span>
      </div>
    </div>
  )
}

export default function ResponsiveOrdersStatus() {
  const { data: tableData } = useTableContext()
  const tableId = tableData?.table.id
  const organizationId = tableData?.organization.id

  const {
    data: result,
    error,
    refetch,
    isPending,
    isRefetching,
  } = useActiveOrders(tableId, organizationId)

  const orders = result?.orders ?? []
  const tableSessionId = result?.tableSessionId

  const totalAmount = useMemo(
    () => orders.reduce((sum, o) => sum + (o.grandTotal ?? 0), 0),
    [orders]
  )

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger>
        <RippleButton />
      </ResponsiveModalTrigger>

      <ResponsiveModalContent thumbClassName="mt-1">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Your Orders</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {orders.length === 0
              ? ""
              : "Sit tight our chefs are preparing your order."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalBody className="pb-4 no-scrollbar max-h-[60vh] overflow-x-hidden overflow-y-auto">
          {isPending && <Skeleton className="h-24 w-full" />}
          {!isPending && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <IconShoppingBag className="size-10" />
              <p className="text-sm text-center">
                Order something,
                <br /> you will see it here.
              </p>
            </div>
          ) : tableSessionId ? (
            <div className="space-y-3">
              {orders.length > 1 && (
                <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">
                    All Rounds Total
                  </span>
                  <span className="font-semibold tabular-nums">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {orders.map((order, idx) => (
                <OrderRoundCard
                  key={order.id}
                  order={order}
                  label={
                    orders.length > 1
                      ? `Round ${orders.length - idx}`
                      : `#${order.invoiceNumber}`
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderRoundCard
                  key={order.id}
                  order={order}
                  label={`#${order.invoiceNumber}`}
                />
              ))}
            </div>
          )}
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          <Button
            onClick={() => refetch()}
            size="lg"
            disabled={isRefetching || isPending}
          >
            Refresh
            {(isRefetching || isPending) && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
