"use client"

import { useEffect, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type OrderEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

export function useOrderStream(orderId: string, organizationId: string) {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId || !organizationId) return

    const es = new EventSource(
      `/api/organization/orders/${orderId}/stream?organizationId=${organizationId}`
    )

    es.addEventListener("init", (e) => {
      setOrder(JSON.parse(e.data))
      setConnected(true)
      setError(null)
    })

    const handleEvent = (e: MessageEvent) => {
      const event: OrderEvent = {
        type: e.type as OrderEvent["type"],
        data: JSON.parse(e.data),
      }

      if (event.type === "deleted") {
        setOrder(null)
      } else {
        setOrder(event.data as OrderResponse)
      }
    }

    es.addEventListener("created", handleEvent)
    es.addEventListener("updated", handleEvent)
    es.addEventListener("deleted", handleEvent)

    es.onerror = () => {
      setConnected(false)
      setError("Connection lost")
    }

    return () => es.close()
  }, [orderId, organizationId])

  return { order, connected, error }
}
