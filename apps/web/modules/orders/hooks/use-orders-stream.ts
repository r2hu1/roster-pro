"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  OrderResponse,
  OrderStats,
} from "@workspace/shared/schemas/order/index"
import { fetchOrders, fetchOrderStats } from "../api/orders"

type OrdersEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

const PAGE_SIZE = 9
const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 30000
const STATS_DEBOUNCE_MS = 400

const EMPTY_STATS: OrderStats = {
  total: 0,
  pending: 0,
  confirmed: 0,
  preparing: 0,
  ready: 0,
  served: 0,
  completed: 0,
  cancelled: 0,
}

export interface UseOrdersStreamParams {
  status?: string | null
  search?: string | null
}

function compareOrders(a: OrderResponse, b: OrderResponse): number {
  const at = new Date(a.createdAt).getTime()
  const bt = new Date(b.createdAt).getTime()
  if (at !== bt) return bt - at
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0
}

function matchesFilter(
  order: OrderResponse,
  status?: string | null,
  search?: string | null
): boolean {
  if (status && status !== "all" && order.status !== status) return false
  const q = search?.trim().toLowerCase()
  if (q) {
    const hay = [order.invoiceNumber, order.tableNumber, order.customerName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

export function useOrdersStream(params: UseOrdersStreamParams = {}) {
  const { status, search } = params

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const storeRef = useRef<Map<string, OrderResponse>>(new Map())
  const cursorRef = useRef<string | null>(null)
  const loadingMoreRef = useRef(false)

  const statusRef = useRef(status)
  const searchRef = useRef(search)
  statusRef.current = status
  searchRef.current = search

  const bell = useRef<HTMLAudioElement | null>(null)
  const statsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rebuild = useCallback(() => {
    setOrders(Array.from(storeRef.current.values()).sort(compareOrders))
  }, [])

  const refreshStats = useCallback(() => {
    fetchOrderStats()
      .then(setStats)
      .catch(() => {})
  }, [])

  const scheduleStatsRefresh = useCallback(() => {
    if (statsTimer.current) clearTimeout(statsTimer.current)
    statsTimer.current = setTimeout(refreshStats, STATS_DEBOUNCE_MS)
  }, [refreshStats])

  useEffect(() => {
    let cancelled = false
    setLoadingInitial(true)
    storeRef.current = new Map()
    cursorRef.current = null

    fetchOrders({ status, search, limit: PAGE_SIZE })
      .then((page) => {
        if (cancelled) return
        const next = new Map<string, OrderResponse>()
        for (const o of page.data) next.set(o.id, o)
        storeRef.current = next
        cursorRef.current = page.nextCursor
        setHasMore(page.hasMore)
        rebuild()
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load orders")
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false)
      })

    return () => {
      cancelled = true
    }
  }, [status, search, rebuild])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !cursorRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const page = await fetchOrders({
        status: statusRef.current,
        search: searchRef.current,
        cursor: cursorRef.current,
        limit: PAGE_SIZE,
      })
      for (const o of page.data) storeRef.current.set(o.id, o)
      cursorRef.current = page.nextCursor
      setHasMore(page.hasMore)
      rebuild()
    } catch {
      // keep current window; hasMore stays true so the user can retry
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [rebuild])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  useEffect(() => {
    bell.current = new Audio("/audios/bell.wav")

    const unlock = async () => {
      try {
        bell.current!.muted = true
        await bell.current!.play()
        bell.current!.pause()
        bell.current!.currentTime = 0
        bell.current!.muted = false
      } catch {}
      window.removeEventListener("pointerdown", unlock)
    }
    window.addEventListener("pointerdown", unlock)

    let es: EventSource | null = null
    let closed = false
    let delay = RECONNECT_BASE_MS
    let retry: ReturnType<typeof setTimeout> | null = null

    const ring = () => {
      if (!bell.current) return
      bell.current.currentTime = 0
      bell.current.play().catch(() => {})
    }

    const applyDelta = (event: OrdersEvent) => {
      const store = storeRef.current
      let changed = false

      if (event.type === "deleted") {
        changed = store.delete(event.data.id)
      } else {
        const order = event.data
        const fits = matchesFilter(
          order,
          statusRef.current,
          searchRef.current
        )
        if (fits) {
          store.set(order.id, order)
          changed = true
        } else if (store.delete(order.id)) {
          changed = true
        }
      }

      if (changed) {
        rebuild()
        if (event.type !== "deleted") ring()
      }
      scheduleStatsRefresh()
    }

    const connect = () => {
      if (closed) return
      es = new EventSource("/api/organization/orders/stream")

      es.addEventListener("ready", () => {
        setConnected(true)
        setError(null)
        delay = RECONNECT_BASE_MS
      })

      const handleEvent = (e: MessageEvent) => {
        applyDelta({
          type: e.type as OrdersEvent["type"],
          data: JSON.parse(e.data),
        } as OrdersEvent)
      }

      es.addEventListener("created", handleEvent)
      es.addEventListener("updated", handleEvent)
      es.addEventListener("deleted", handleEvent)
      es.addEventListener("ping", () => setError(null))

      es.onopen = () => {
        setConnected(true)
        setError(null)
        delay = RECONNECT_BASE_MS
      }

      es.onerror = () => {
        setConnected(false)
        setError("Connection lost")
        es?.close()
        if (!closed) {
          const wait = delay
          delay = Math.min(delay * 2, RECONNECT_MAX_MS)
          retry = setTimeout(connect, wait)
        }
      }
    }

    connect()

    return () => {
      closed = true
      es?.close()
      if (retry) clearTimeout(retry)
      if (statsTimer.current) clearTimeout(statsTimer.current)
      window.removeEventListener("pointerdown", unlock)
    }
  }, [rebuild, scheduleStatsRefresh])

  return {
    orders,
    stats,
    connected,
    error,
    hasMore,
    loadingInitial,
    loadingMore,
    loadMore,
  }
}
