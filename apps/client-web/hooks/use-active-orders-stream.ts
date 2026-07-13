"use client"

import { useEffect, useRef, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { useRealtime } from "@/lib/realtime-client"

type StreamState = {
  orders: OrderResponse[]
  connected: boolean
  error: string | null
}

const isActive = (status: string) =>
  status !== "completed" && status !== "cancelled"

const sortOrders = (orders: OrderResponse[]) =>
  orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

export function useActiveOrdersStream(
  tableId?: string | null,
  organizationId?: string | null
): StreamState {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<Map<string, OrderResponse>>(new Map())
  const tableRef = useRef<string | null>(null)

  const sync = () =>
    setOrders(
      Array.from(mapRef.current.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    )

  useEffect(() => {
    if (!tableId || !organizationId) return

    mapRef.current = new Map()
    setOrders([])
    setError(null)
    setConnected(false)

    fetch(
      `/api/organization/orders/table/${tableId}/active?organizationId=${organizationId}`
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          mapRef.current = new Map(
            result.data.map((o: OrderResponse) => [o.id, o])
          )
          sync()
          tableRef.current = result.tableNumber
        }
      })
      .catch(() => {})
  }, [tableId, organizationId])

  const { status: connectionStatus } = useRealtime({
    channels: organizationId ? [`orders:${organizationId}`] : [],
    events: ["order.created", "order.updated", "order.deleted"],
    onData({ event, data }) {
      const sseEvent = event.split(".")[1]

      if (sseEvent === "deleted") {
        const { id } = data as { id: string }
        if (mapRef.current.delete(id)) sync()
        return
      }

      const o = data as OrderResponse
      if (o.tableNumber === tableRef.current && isActive(o.status)) {
        mapRef.current.set(o.id, o)
        sync()
      } else if (mapRef.current.delete(o.id)) {
        sync()
      }
    },
  })

  useEffect(() => {
    setConnected(connectionStatus === "connected")
    if (connectionStatus === "error") {
      setError("Reconnecting\u2026")
    } else if (connectionStatus === "connected") {
      setError(null)
    }
  }, [connectionStatus])

  return { orders, connected, error }
}
