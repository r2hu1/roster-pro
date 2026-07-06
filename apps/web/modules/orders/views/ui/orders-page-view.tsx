"use client"

import PageHeader from "@/components/page-header"
import { useOrdersStream } from "../../hooks/use-orders-stream"
import {
  IconCirclePlus,
  IconReceiptRupee,
  IconSearch,
  IconToolsKitchen2Off,
  IconWifi,
  IconWifiOff,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"
import { useMemo, useState } from "react"
import type { OrderStatus } from "@workspace/shared/enums"
import EmptyData from "@/components/empty"

const filters: { label: string; value: "All" | OrderStatus }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-orange-100 text-orange-800 border-orange-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  served: "bg-teal-100 text-teal-800 border-teal-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const paymentStyles: Record<string, string> = {
  pending: "text-yellow-600",
  paid: "text-emerald-600",
  failed: "text-red-600",
  refunded: "text-purple-600",
}

export default function OrdersPageView() {
  const { orders, connected } = useOrdersStream()
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [search, setSearch] = useState("")

  const totalOrders = orders.length
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const completedCount = orders.filter((o) => o.status === "completed").length
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length

  const filtered = useMemo(() => {
    let result = orders
    if (activeFilter !== "All") {
      result = result.filter((o) => o.status === activeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.tableNumber.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, activeFilter, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        actions={
          <div className="flex items-center gap-3">
            {connected ? (
              <IconWifi className="size-4 text-emerald-500" />
            ) : (
              <IconWifiOff className="size-4 text-red-500" />
            )}
            <Button>
              New Order <IconCirclePlus />
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        <div className="flex bg-secondary rounded-xl overflow-hidden">
          <div className="rounded-xl w-full bg-linear-to-b from-primary to-chart-4 text-primary-foreground p-4 space-y-6">
            <p className="flex items-start gap-3 text-base font-medium justify-between">
              Total Orders <IconReceiptRupee className="size-6" />
            </p>
            <h1 className="text-3xl font-bold">{totalOrders}</h1>
          </div>
          <div className="bg-secondary w-full border-r-2 p-4 flex items-center justify-center px-6">
            <p className="flex gap-4 text-lg font-medium items-center">
              Pending <span className="text-primary">{pendingCount}</span>
            </p>
          </div>
          <div className="bg-secondary w-full border-r-2 p-4 flex items-center justify-center px-6">
            <p className="flex gap-4 text-lg font-medium items-center">
              Completed <span className="text-primary">{completedCount}</span>
            </p>
          </div>
          <div className="bg-secondary w-full p-4 flex items-center justify-center px-6">
            <p className="flex gap-4 text-lg font-medium items-center">
              Cancelled <span className="text-primary">{cancelledCount}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex min-w-fit rounded-md bg-sidebar overflow-hidden">
            {filters.map((f) => (
              <Button
                size="lg"
                key={f.value}
                variant="secondary"
                className={cn(
                  "rounded-none",
                  activeFilter === f.value && "bg-primary/15! text-primary!"
                )}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <InputGroup>
            <InputGroupInput
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-background space-y-2 border rounded-lg p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={statusStyles[order.status]}
                >
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
                <h3 className="text-base font-medium">
                  {order.invoiceNumber}
                </h3>
                <h3 className="text-xl font-medium">{order.tableNumber}</h3>
              </div>
              <div className="flex items-center justify-between">
                <p>₹{order.grandTotal}</p>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 && "s"}
                </p>
              </div>
            </div>
          ))}
        </div>
          {filtered.length === 0 && (
            <EmptyData title="No orders recieved yet." description="Let your customer order, and you will see it here in realtime." icon={<IconToolsKitchen2Off/>}/>
          )}
      </div>
    </div>
  )
}
