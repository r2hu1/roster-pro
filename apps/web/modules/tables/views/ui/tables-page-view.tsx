"use client"

import { useMemo } from "react"
import PageHeader from "@/components/page-header"
import { TableStats } from "./table-stats"
import { Button } from "@workspace/ui/components/button"
import {
  IconCirclePlus,
  IconWifi,
  IconWifiOff,
  IconToolsKitchen2Off,
} from "@tabler/icons-react"
import CreateTableModal from "./create-table-responsive-modal"
import UpdateTableModal from "./update-table-responsive-modal"
import { TableCard } from "./table-card"
import { useTableStatusStream } from "../../hooks/use-table-status-stream"
import EmptyData from "@/components/empty"

export default function TablesPageView() {
  const { tables, connected } = useTableStatusStream()

  const total = tables.length
  const occupied = tables.filter((t) => t.status === "occupied").length
  const available = tables.filter((t) => t.status === "available").length

  const sorted = useMemo(
    () => [...tables].sort((a, b) => a.number - b.number),
    [tables]
  )

  return (
    <div>
      <PageHeader
        title="Tables"
        actions={
          <div className="flex items-center gap-3">
            {connected ? (
              <IconWifi className="size-4" />
            ) : (
              <IconWifiOff className="size-4" />
            )}
            <CreateTableModal>
              <Button>
                Add Table <IconCirclePlus />
              </Button>
            </CreateTableModal>
          </div>
        }
      />
      <div className="space-y-6">
        <TableStats total={total} occupied={occupied} available={available} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {sorted.map((table) => (
            <UpdateTableModal key={table.id} table={table}>
              <TableCard
                number={String(table.number)}
                name={table.name ?? undefined}
                status={table.status}
                tableId={table.id}
              />
            </UpdateTableModal>
          ))}
        </div>
        {sorted.length === 0 && (
          <EmptyData
            title="No tables yet."
            description="Add a table to start taking orders."
            icon={<IconToolsKitchen2Off />}
          />
        )}
      </div>
    </div>
  )
}
