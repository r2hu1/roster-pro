"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import PageHeader from "@/components/page-header"
import EmptyData from "@/components/empty"
import { useOrdersStream } from "../../hooks/use-orders-stream"
import CreateManualOrderModal from "./create-manual-order-responsive-modal"
import { OrdersStats } from "./orders-stats"
import { OrdersFilters } from "./orders-filters"
import { OrderCard } from "./order-card"
import { useSession } from "@/modules/providers/session-provider"
import { ForkKnife, PlusCircle, Wifi, WifiOff } from "reicon-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { useQueryState } from "nuqs"
import { LoadMoreSentinel } from "./load-more-sentinel"

const SEARCH_DEBOUNCE_MS = 350

export default function OrdersPageView() {
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

  // Sessions with 2+ orders in the loaded list are multi-round
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
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Realtime orders of your restaurant."
        actions={
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger>
                {connected ? (
                  <Wifi className="size-4" />
                ) : (
                  <WifiOff className="size-4" />
                )}
              </TooltipTrigger>
              <TooltipContent align="center">
                {connected ? "Live Orders" : "Offline, refresh to reconnect"}
              </TooltipContent>
            </Tooltip>
            <CreateManualOrderModal>
              <Button>
                New Order <PlusCircle />
              </Button>
            </CreateManualOrderModal>
          </div>
        }
      />
      <div className="space-y-6">
        {loadingInitial && orders.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <OrdersStats
              total={stats.total}
              pending={stats.pending}
              ready={stats.ready}
              completed={stats.completed}
              cancelled={stats.cancelled}
            />
            <OrdersFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              search={search}
              onSearchChange={setSearch}
            />
            {loadingFilter && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  multiRound={isMultiRound(order)}
                />
              ))}
            </div>
            <LoadMoreSentinel
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
            {orders.length === 0 && (
              <EmptyData
                title={`No orders ${statusFilter ?? "received"} yet.`}
                description={`${statusFilter ?? ""} orders will appear here as they are placed.`}
                icon={<ForkKnife />}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
