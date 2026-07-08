"use client"

import { useOrdersStream } from "@/modules/orders/hooks/use-orders-stream"
import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import { useSession } from "@/modules/providers/session-provider"
import { useMemo, useState } from "react"
import { IconSearch } from "@tabler/icons-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import ReceiptsDataTable from "./receipts-data-table"

export default function ReceiptsPageView() {
  const { orders, connected } = useOrdersStream()
  const { organization } = useSession()
  const { kitchenMode } = useKitchenMode()
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [search, setSearch] = useState("")

  const totalOrders = orders.length
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const readyCount = orders.filter((o) => o.status === "ready").length
  const completedCount = orders.filter((o) => o.status === "completed").length
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length

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
      <div className="flex items-center justify-between">
        <div className="space-y-0">
          <h1 className="text-2xl font-medium tracking-tight">Receipts</h1>
          <p className="text-sm text-muted-foreground md:text-lg">
            All receipts for orders till date.
          </p>
        </div>
      </div>
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
