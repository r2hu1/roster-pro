"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useSession } from "@/modules/providers/session-provider"
import { useState, useEffect, useMemo, useCallback } from "react"
import { IconSearch } from "@tabler/icons-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { fetchOrders } from "@/modules/orders/api/orders"
import ReceiptsDataTable from "./receipts-data-table"
import PageHeader from "@/components/page-header"
import { LoadMoreSentinel } from "@/modules/orders/views/ui/load-more-sentinel"

const SEARCH_DEBOUNCE_MS = 350

export default function ReceiptsPageView() {
  const { organization } = useSession()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["receipts", organization?.id, debouncedSearch],
    queryFn: ({ pageParam }) =>
      fetchOrders({
        cursor: pageParam,
        limit: 12,
        search: debouncedSearch.trim() || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!organization?.id,
  })

  const orders = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  )

  const handleLoadMore = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Receipts"
          description="All receipts for orders till date."
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Receipts"
          description="All receipts for orders till date."
        />
        <div className="text-red-500">Failed to load receipts.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Receipts"
        description="All receipts for orders till date."
      />
      <InputGroup className="w-full">
        <InputGroupInput
          placeholder="Search by invoice, table, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
      </InputGroup>
      <ReceiptsDataTable orders={orders} />
      <LoadMoreSentinel
        hasMore={hasNextPage}
        loadingMore={isFetchingNextPage}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
