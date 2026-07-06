"use client"

import { useEffect, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type OrdersEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

export function useOrdersStream() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const es = new EventSource("/api/organization/orders/stream")

    es.addEventListener("init", (e) => {
      setOrders(JSON.parse(e.data))
      setConnected(true)
      setError(null)
    })

    const handleEvent = (e: MessageEvent) => {
      const event: OrdersEvent = {
        type: e.type as OrdersEvent["type"],
        data: JSON.parse(e.data),
      }

      setOrders((prev) => {
        switch (event.type) {
          case "created":
            return [event.data as OrderResponse, ...prev]
          case "updated": {
            const updated = event.data as OrderResponse
            return prev.map((o) => (o.id === updated.id ? updated : o))
          }
          case "deleted":
            return prev.filter((o) => o.id !== event.data.id)
          default:
            return prev
        }
      })
    }

    es.addEventListener("created", handleEvent)
    es.addEventListener("updated", handleEvent)
    es.addEventListener("deleted", handleEvent)

    es.onerror = () => {
      setConnected(false)
      setError("Connection lost")
    }

    return () => es.close()
  }, [])

  return { orders, connected, error }
}
