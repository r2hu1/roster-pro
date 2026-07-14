"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/modules/providers/session-provider"
import { useMemo, useState } from "react"
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

export default function ReceiptsPageView() {
  const { organization } = useSession()
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders({ limit: 100 }),
    enabled: !!organization?.id,
  })

  const orders = data?.data ?? []

  const filtered = useMemo(() => {
    let result = orders
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
  }, [orders, search])

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

  if (error) {
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
      <ReceiptsDataTable orders={filtered} />
    </div>
  )
}
