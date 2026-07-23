"use client"

import { useState, useEffect, useCallback } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import EmptyData from "@/components/empty"
import { useOrdersStream } from "../../hooks/use-orders-stream"
import { OrdersFilters } from "./orders-filters"
import { KitchenOrderCard } from "./kitchen-order-card"
import { Logo } from "@/components/logo"
import { useSession } from "@/modules/providers/session-provider"
import { cn } from "@workspace/ui/lib/utils"
import { ForkKnife, Wifi, WifiOff } from "reicon-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { useQueryState } from "nuqs"
import { LoadMoreSentinel } from "./load-more-sentinel"

const SEARCH_DEBOUNCE_MS = 350

export default function KitchenDisplayView() {
  const { organization } = useSession()
  const organizationId = organization?.id
  const [activeFilter, setActiveFilter] = useQueryState("filters", {
    defaultValue: "All",
  })
  const [search, setSearch] = useQueryState("query", {
    defaultValue: "",
  })

  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  const statusFilter =
    activeFilter === "All" ? undefined : activeFilter.toLowerCase()

  const {
    orders,
    stats,
    connected,
    hasMore,
    loadingInitial,
    loadingFilter,
    loadingMore,
    loadMore,
  } = useOrdersStream({
    organizationId: organizationId!,
    status: statusFilter,
    search: debouncedSearch,
  })

  const sessionCounts = new Map<string, number>()
  for (const o of orders) {
    if (o.tableSessionId) {
      sessionCounts.set(
        o.tableSessionId,
        (sessionCounts.get(o.tableSessionId) ?? 0) + 1
      )
    }
  }
  const isMultiRound = (o: (typeof orders)[number]) =>
    !!o.tableSessionId && (sessionCounts.get(o.tableSessionId) ?? 0) > 1

  const handleLoadMore = useCallback(() => {
    void loadMore()
  }, [loadMore])

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="shrink-0 border-b bg-background/80 backdrop-blur px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo
            src={organization?.logo}
            className="h-10 shrink-0"
            type="icon"
          />
          <div className="min-w-0">
            <h1 className="text-base font-medium leading-tight truncate">
              {organization?.name}
            </h1>
            <p className="text-xs text-muted-foreground truncate">Taking Live Orders</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-1.5 text-xs md:text-sm bg-secondary p-2 rounded-full px-3 font-medium">
                {connected ? (
                  <Wifi className="size-4" />
                ) : (
                  <WifiOff className="size-4" />
                )}
                <span>{connected ? "Live" : "Offline"}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent align="center">
              {connected ? "Live orders" : "Offline, refresh to re-connect."}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-3 space-y-3">
        <OrdersFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
          excludeCompleted
        />
        {loadingFilter && !loadingInitial && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto px-4 sm:px-6 py-4">
        {loadingInitial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : !loadingFilter && orders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyData
              title="No orders received yet."
              description="Let your customer order, and you will see it here in realtime."
              icon={<ForkKnife className="size-8" />}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {orders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  status={activeFilter.toLowerCase()}
                  multiRound={isMultiRound(order)}
                />
              ))}
            </div>
            <LoadMoreSentinel
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          </>
        )}
      </div>
    </div>
  )
}
