"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import PageHeader from "@/components/page-header"
import EmptyData from "@/components/empty"
import { useOrdersStream } from "../../hooks/use-orders-stream"
import CreateManualOrderModal from "./create-manual-order-responsive-modal"
import { OrdersStats } from "./orders-stats"
import { OrdersFilters } from "./orders-filters"
import { OrderCard } from "./order-card"
import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import { Logo } from "@/components/logo"
import { useSession } from "@/modules/providers/session-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Loader } from "@workspace/ui/components/loader"
import { ForkKnife, PlusCircle, Wifi, WifiOff } from "reicon-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

const SEARCH_DEBOUNCE_MS = 350

function useClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function LoadMoreSentinel({
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasMore) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, onLoadMore])

  if (!hasMore) return null

  return (
    <div ref={ref} className="flex justify-center py-6">
      <Button variant="secondary" onClick={onLoadMore} disabled={loadingMore}>
        Load more
        {loadingMore && <Loader />}
      </Button>
    </div>
  )
}

export default function OrdersPageView() {
  const { organization } = useSession()
  const organizationId = organization?.id
  const { kitchenMode } = useKitchenMode()
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const clock = useClock()

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

  if (kitchenMode) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <div className="shrink-0 border-b backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo
              src={organization?.logo}
              className="h-8 sm:h-14 shrink-0"
              type="icon"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold leading-tight truncate">
                {organization?.name}
              </h1>
              <p className="text-xs sm:text-sm truncate">Live Orders</p>
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
              <Tooltip>
                <TooltipTrigger>
                  {connected ? (
                    <Wifi className="size-4" />
                  ) : (
                    <WifiOff className="size-4" />
                  )}
                </TooltipTrigger>
                <TooltipContent align="center">
                  {connected ? "Live Orders" : "Offline"}
                </TooltipContent>
              </Tooltip>
              {connected ? "Live" : "Offline"}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 sm:px-6 pt-4 space-y-3">
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
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto px-4 sm:px-6 py-4">
          {!loadingFilter && orders.length === 0 ? (
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
                  <OrderCard
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
