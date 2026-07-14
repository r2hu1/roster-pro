"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { channels } from "@workspace/shared/realtime"
import { useRealtime } from "@/lib/realtime-client"

type OrderEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

export function useOrderStream(orderId: string, organizationId: string) {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(() => {
    return fetch(
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

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const { status: connectionStatus } = useRealtime({
    channels: [channels.order(organizationId, orderId)],
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

  const wasConnected = useRef(false)
  useEffect(() => {
    const isConnected = connectionStatus === "connected"
    setConnected(isConnected)
    if (isConnected) {
      if (wasConnected.current) void fetchOrder()
      wasConnected.current = true
      setError(null)
    } else {
      if (connectionStatus === "error") setError("Connection lost")
      wasConnected.current = false
    }
  }, [connectionStatus, fetchOrder])

  return { order, connected, error }
}
