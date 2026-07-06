"use client"

import { useMemo, useState } from "react"
import { IconCirclePlus, IconToolsKitchen2Off, IconWifi, IconWifiOff } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import PageHeader from "@/components/page-header"
import EmptyData from "@/components/empty"
import { useOrdersStream } from "../../hooks/use-orders-stream"
import { OrdersStats } from "./orders-stats"
import { OrdersFilters } from "./orders-filters"
import { OrderCard } from "./order-card"

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
              <IconWifi className="size-4" />
            ) : (
              <IconWifiOff className="size-4" />
            )}
            <Button>
              New Order <IconCirclePlus />
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        <OrdersStats
          total={totalOrders}
          pending={pendingCount}
          completed={completedCount}
          cancelled={cancelledCount}
        />
        <OrdersFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
        {filtered.length === 0 && (
          <EmptyData
            title="No orders recieved yet."
            description="Let your customer order, and you will see it here in realtime."
            icon={<IconToolsKitchen2Off />}
          />
        )}
      </div>
    </div>
  )
}
