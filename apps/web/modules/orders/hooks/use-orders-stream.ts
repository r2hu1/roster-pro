"use client"

import { useEffect, useRef, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type OrdersEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 30000

export function useOrdersStream() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const delayRef = useRef(RECONNECT_BASE_MS)

  useEffect(() => {
    let es: EventSource | null = null
    let closed = false

    const connect = () => {
      if (closed) return
      es = new EventSource("/api/organization/orders/stream")

      es.addEventListener("init", (e) => {
        setOrders(JSON.parse(e.data))
        setConnected(true)
        setError(null)
        delayRef.current = RECONNECT_BASE_MS
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

      es.addEventListener("ping", () => {
        setError(null)
      })

      es.onerror = () => {
        setConnected(false)
        setError("Connection lost")
        es?.close()

        if (!closed) {
          const delay = delayRef.current
          delayRef.current = Math.min(delay * 2, RECONNECT_MAX_MS)
          retryRef.current = setTimeout(connect, delay)
        }
      }
    }

    connect()

    return () => {
      closed = true
      es?.close()
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [])

  return { orders, connected, error }
}
