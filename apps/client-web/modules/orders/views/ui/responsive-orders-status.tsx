"use client"

import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
} from "@workspace/ui/components/responsive-modal"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { IconBurger, IconShoppingBag } from "@tabler/icons-react"
import { useOrdersStream } from "../providers/orders-stream"
import { Button } from "@workspace/ui/components/button"

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pending", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default" },
  preparing: { label: "Preparing", variant: "default" },
  ready: { label: "Ready", variant: "default" },
  served: { label: "Served", variant: "outline" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

interface Props {
  children: React.ReactNode
}

export default function ResponsiveOrdersStatus() {
  const { orders, connected, error } = useOrdersStream()

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button size="icon-lg" className="z-50 fixed bottom-10 right-10"><IconBurger/></Button>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Your Orders</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {connected
              ? `${orders.length} active order${orders.length === 1 ? "" : "s"}`
              : error ?? "Connecting…"}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <IconShoppingBag className="size-10" />
              <p className="text-sm">No active orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border bg-card p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{order.invoiceNumber}
                    </span>
                    <Badge
                      variant={
                        statusLabel[order.status]?.variant ?? "secondary"
                      }
                      className="text-[10px] px-2 py-0"
                    >
                      {statusLabel[order.status]?.label ?? order.status}
                    </Badge>
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
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-medium tabular-nums">
                      ₹{order.grandTotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
