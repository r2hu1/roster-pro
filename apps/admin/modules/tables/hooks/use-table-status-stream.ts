"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { TableStatusResponse } from "@workspace/shared/schemas/table/response"
import { channels } from "@workspace/shared/realtime"
import { useRealtime } from "@/lib/realtime-client"

export function useTableStatusStream(organizationId: string) {
  const [tables, setTables] = useState<TableStatusResponse[]>([])
  const [connected, setConnected] = useState(false)

  const fetchTables = useCallback(() => {
    return fetch("/api/organization/table/")
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          setTables(result.data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const { status: connectionStatus } = useRealtime({
    channels: [channels.table(organizationId)],
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

  // Refetch on reconnect to recover any status changes missed while offline.
  const wasConnected = useRef(false)
  useEffect(() => {
    const isConnected = connectionStatus === "connected"
    setConnected(isConnected)
    if (isConnected) {
      if (wasConnected.current) void fetchTables()
      wasConnected.current = true
    } else {
      wasConnected.current = false
    }
  }, [connectionStatus, fetchTables])

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
