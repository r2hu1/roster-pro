"use client"

import { useEffect, useState, useCallback } from "react"

type TableStatus = {
  tableId: string
  number: number
  name: string | null
  status: "available" | "occupied"
  updatedAt: Date
}

export function useTableStatusStream() {
  const [tables, setTables] = useState<TableStatus[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource("/api/organization/table/status/stream")

    es.addEventListener("init", (e) => {
      setTables(JSON.parse(e.data))
      setConnected(true)
    })

    es.addEventListener("status", (e) => {
      const updated: TableStatus = JSON.parse(e.data)
      setTables((prev) =>
        prev.map((t) => (t.tableId === updated.tableId ? updated : t))
      )
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
