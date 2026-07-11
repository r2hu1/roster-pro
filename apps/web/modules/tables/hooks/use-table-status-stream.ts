"use client"

import { useEffect, useState, useCallback } from "react"
import type { TableStatusResponse } from "@workspace/shared/schemas/table/response"

export function useTableStatusStream() {
  const [tables, setTables] = useState<TableStatusResponse[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource("/api/organization/table/status/stream")

    es.addEventListener("init", (e) => {
      setTables(JSON.parse(e.data))
      setConnected(true)
    })

    es.addEventListener("status", (e) => {
      const updated: TableStatusResponse = JSON.parse(e.data)
      setTables((prev) => {
        const idx = prev.findIndex((t) => t.id === updated.id)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = updated
          return next
        }
        return [...prev, updated]
      })
    })

    es.addEventListener("deleted", (e) => {
      const { id } = JSON.parse(e.data)
      setTables((prev) => prev.filter((t) => t.id !== id))
    })

    es.onerror = () => {
      setConnected(false)
    }

    return () => es.close()
  }, [])

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
