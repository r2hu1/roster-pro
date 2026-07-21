"use client"

import { useEffect, useRef, useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type StreamState = {
  orders: OrderResponse[]
  connected: boolean
  error: string | null
}

const POLL_INTERVAL = 10_000

export function useActiveOrdersStream(enabled = true): StreamState {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<Map<string, OrderResponse>>(new Map())

  const sync = () =>
    setOrders(
      Array.from(mapRef.current.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    )

  useEffect(() => {
    if (!enabled) return

    mapRef.current = new Map()
    setOrders([])
    setError(null)
    setConnected(false)

    let stopped = false

    const fetchOrders = () => {
      fetch("/api/public/qr/orders/active", { credentials: "include" })
        .then((res) => {
          if (res.status === 401) {
            stopped = true
            // SESSION_ENDED (checkout / staff action / regen) → thank-you;
            // plain expiry → back to the scanner.
            return res
              .json()
              .catch(() => null)
              .then((body) => {
                window.location.href =
                  body?.errorCode === "SESSION_ENDED" ? "/thank-you" : "/"
                return null
              })
          }
          return res.json()
        })
        .then((result) => {
          if (!result || stopped) return
          if (result.status === "success") {
            mapRef.current = new Map(
              result.data.map((o: OrderResponse) => [o.id, o])
            )
            sync()
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
    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [enabled])

  return { orders, connected, error }
}
