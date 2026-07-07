"use client"

import { useEffect, useState, useCallback } from "react"
import type { TableStatusResponse } from "@workspace/shared/schemas/table/index"

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
      setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    })

    es.onerror = () => setConnected(false)

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
