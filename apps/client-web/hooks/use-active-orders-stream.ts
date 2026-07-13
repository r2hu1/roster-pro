"use client"

import { useEffect, useRef, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type StreamState = {
  orders: OrderResponse[]
  connected: boolean
  error: string | null
}

const POLL_INTERVAL = 10_000

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

    const fetchOrders = () => {
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
            setConnected(true)
            setError(null)
          }
        })
        .catch(() => {
          setConnected(false)
        })
    }

    fetchOrders()
    const interval = setInterval(fetchOrders, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [tableId, organizationId])

  return { orders, connected, error }
}
