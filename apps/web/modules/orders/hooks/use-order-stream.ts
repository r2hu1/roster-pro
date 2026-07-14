"use client"

import { useEffect, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { useRealtime } from "@/lib/realtime-client"

type OrderEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

export function useOrderStream(orderId: string, organizationId: string) {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(
      `/api/organization/orders/${orderId}?organizationId=${organizationId}`
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          setOrder(result.data)
        }
      })
      .catch(() => {})
  }, [orderId, organizationId])

  const { status: connectionStatus } = useRealtime({
    channels: [`order:${orderId}`],
    events: ["order.created", "order.updated", "order.deleted"],
    onData({ event, data }) {
      const sseEvent = event.split(".")[1]
      let payload: OrderEvent
      if (sseEvent === "deleted") {
        payload = { type: "deleted", data: data as { id: string } }
      } else {
        payload = {
          type: sseEvent as "created" | "updated",
          data: data as OrderResponse,
        }
      }

      if (payload.type === "deleted") {
        setOrder(null)
      } else {
        setOrder(payload.data as OrderResponse)
      }
    },
  })

  useEffect(() => {
    setConnected(connectionStatus === "connected")
    if (connectionStatus === "error") {
      setError("Connection lost")
    } else if (connectionStatus === "connected") {
      setError(null)
    }
  }, [connectionStatus])

  return { order, connected, error }
}
