"use client"

import { useOrdersStream } from "@/modules/orders/hooks/use-orders-stream"
import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import { useSession } from "@/modules/providers/session-provider"
import { useMemo, useState } from "react"
import { IconSearch } from "@tabler/icons-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import ReceiptsDataTable from "./receipts-data-table"
import PageHeader from "@/components/page-header"

export default function ReceiptsPageView() {
  const { orders, connected } = useOrdersStream()
  const { organization } = useSession()
  const { kitchenMode } = useKitchenMode()
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let result = orders
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
  }, [orders, activeFilter, search])
  return (
    <div className="space-y-4">
      <PageHeader
        title="Receipts"
        description="All receipts for orders till date."
      />
      {!connected && orders.length === 0 ? (
        <Skeleton className="h-100 w-full" />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
