"use client"

import { useEffect, useState, useCallback } from "react"
import type { TableStatusResponse } from "@workspace/shared/schemas/table/response"
import { useRealtime } from "@/lib/realtime-client"

export function useTableStatusStream(organizationId: string) {
  const [tables, setTables] = useState<TableStatusResponse[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    fetch("/api/organization/table/")
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          setTables(result.data)
        }
      })
      .catch(() => {})
  }, [organizationId])

  const { status: connectionStatus } = useRealtime({
    channels: [`table:${organizationId}`],
    events: ["table.status", "table.deleted"],
    onData({ event, data }) {
      const sseEvent = event.split(".")[1]

      if (sseEvent === "deleted") {
        const { id } = data as { id: string }
        setTables((prev) => prev.filter((t) => t.id !== id))
        return
      }

      const updated = data as TableStatusResponse
      setTables((prev) => {
        const idx = prev.findIndex((t) => t.id === updated.id)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = updated
          return next
        }
        return [...prev, updated]
      })
    },
  })

  useEffect(() => {
    setConnected(connectionStatus === "connected")
  }, [connectionStatus])

  const updateStatus = useCallback(
    async (tableId: string, status: "available" | "occupied") => {
      await fetch("/api/organization/table/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tableId, status }),
      })
    },
    []
  )

  return { tables, connected, updateStatus }
}
