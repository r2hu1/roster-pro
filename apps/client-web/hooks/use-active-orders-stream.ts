"use client"

import { useEffect, useRef, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type StreamState = {
  orders: OrderResponse[]
  connected: boolean
  error: string | null
}

/**
 * Realtime active orders for a table over SSE.
 *
 * Server sends `init` (full snapshot) then `upsert` / `remove` deltas derived
 * from order events — no polling. EventSource auto-reconnects on drop.
 */
export function useActiveOrdersStream(
  tableId?: string | null,
  organizationId?: string | null
): StreamState {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<Map<string, OrderResponse>>(new Map())

  useEffect(() => {
    if (!tableId || !organizationId) {
      return
    }

    mapRef.current = new Map()
    setOrders([])

    const sync = () =>
      setOrders(
        Array.from(mapRef.current.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )

    const url = `/api/organization/orders/table/${tableId}/active/stream?organizationId=${organizationId}`
    const es = new EventSource(url)

    es.addEventListener("init", (event) => {
      const list: OrderResponse[] = JSON.parse((event as MessageEvent).data)
      mapRef.current = new Map(list.map((o) => [o.id, o]))
      sync()
    })

    es.addEventListener("upsert", (event) => {
      const o: OrderResponse = JSON.parse((event as MessageEvent).data)
      mapRef.current.set(o.id, o)
      sync()
    })

    es.addEventListener("remove", (event) => {
      const { id } = JSON.parse((event as MessageEvent).data) as { id: string }
      if (mapRef.current.delete(id)) sync()
    })

    es.onopen = () => {
      setConnected(true)
      setError(null)
    }

    es.onerror = () => {
      setConnected(false)
      setError("Stream disconnected, reconnecting…")
    }

    return () => es.close()
  }, [tableId, organizationId])

  return { orders, connected, error }
}
