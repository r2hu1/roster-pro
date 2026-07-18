"use client"

import { useMemo } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { useSession } from "@/modules/providers/session-provider"
import EmptyData from "@/components/empty"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { PlusCircle } from "reicon-react"

export default function TablesPageView() {
  const { organization } = useSession()
  const { tables, connected } = useTableStatusStream(organization?.id ?? "")

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
        description="Manage your restaurant tables in real-time."
        actions={
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger>
                {connected ? (
                  <IconWifi className="size-4" />
                ) : (
                  <IconWifiOff className="size-4" />
                )}
              </TooltipTrigger>
              <TooltipContent align="center">
                {connected ? "Live Tables" : "Offline, refresh to reconnect"}
              </TooltipContent>
            </Tooltip>
            <CreateTableModal>
              <Button>
                Add Table <PlusCircle />
              </Button>
            </CreateTableModal>
          </div>
        }
      />
      <div className="space-y-6">
        {!connected && tables.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <TableStats
              total={total}
              occupied={occupied}
              available={available}
            />
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
          </>
        )}
      </div>
    </div>
  )
}
