"use client"
import { useMemo, useState, useEffect } from "react"
import {
  IconCirclePlus,
  IconToolsKitchen2Off,
  IconWifi,
  IconWifiOff,
} from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import PageHeader from "@/components/page-header"
import EmptyData from "@/components/empty"
import { useOrdersStream } from "../../hooks/use-orders-stream"
import { OrdersStats } from "./orders-stats"
import { OrdersFilters } from "./orders-filters"
import { OrderCard } from "./order-card"
import { dummyOrders } from "../../hooks/dummy-orders"
import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import { Logo } from "@/components/logo"
import { useSession } from "@/modules/providers/session-provider"
import { cn } from "@workspace/ui/lib/utils"

const KITCHEN_COLUMNS = [
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "served", label: "Served" },
]

function useClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function OrdersPageView() {
  const { orders, connected } = useOrdersStream()
  const { organization } = useSession()
  const { kitchenMode } = useKitchenMode()
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [search, setSearch] = useState("")
  const clock = useClock()

  const totalOrders = orders.length
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const readyCount = orders.filter((o) => o.status === "ready").length
  const completedCount = orders.filter((o) => o.status === "completed").length
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length

  const filtered = useMemo(() => {
    let result = dummyOrders
    if (activeFilter !== "All") {
      result = result.filter((o) => o.status === activeFilter.toLowerCase())
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
  }, [dummyOrders, activeFilter, search])

  if (kitchenMode) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <div className="shrink-0 border-b backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="h-8 sm:h-14 shrink-0" type="icon" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold leading-tight truncate">
                Live Orders
              </h1>
              <p className="text-xs sm:text-sm truncate">
                {organization?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:block text-xl font-mono font-semibold tabular-nums">
              {clock.toLocaleTimeString()}
            </span>
            <div
              className={cn(
                "flex items-center gap-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full",
                connected
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              )}
            >
              {connected ? (
                <IconWifi className="size-4" />
              ) : (
                <IconWifiOff className="size-4" />
              )}
              {connected ? "Live" : "Offline"}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 sm:px-6 pt-4">
          <OrdersFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 sm:px-6 py-4">
          {dummyOrders.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <EmptyData
                title="No orders received yet."
                description="Let your customer order, and you will see it here in realtime."
                icon={<IconToolsKitchen2Off className="size-8" />}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

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
          ready={readyCount}
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
