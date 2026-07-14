"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  OrderResponse,
  OrderStats,
} from "@workspace/shared/schemas/order/index"
import { fetchOrders, fetchOrderStats } from "../api/orders"
import { useRealtime } from "@/lib/realtime-client"

type OrdersEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

const PAGE_SIZE = 9
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
  organizationId: string
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

export function useOrdersStream(params: UseOrdersStreamParams) {
  const { organizationId, status, search } = params

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingFilter, setLoadingFilter] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const storeRef = useRef<Map<string, OrderResponse>>(new Map())
  const cursorRef = useRef<string | null>(null)
  const loadingMoreRef = useRef(false)

  const snapshotSeq = useRef(0)
  const initialLoadDone = useRef(false)

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

  const loadSnapshot = useCallback(() => {
    const seq = ++snapshotSeq.current
    if (!initialLoadDone.current) {
      setLoadingInitial(true)
    } else {
      setLoadingFilter(true)
    }
    cursorRef.current = null

    fetchOrders({
      status: statusRef.current,
      search: searchRef.current,
      limit: PAGE_SIZE,
    })
      .then((page) => {
        if (seq !== snapshotSeq.current) return
        const next = new Map<string, OrderResponse>()
        for (const o of page.data) next.set(o.id, o)
        storeRef.current = next
        cursorRef.current = page.nextCursor
        setHasMore(page.hasMore)
        rebuild()
        setError(null)
      })
      .catch(() => {
        if (seq === snapshotSeq.current) setError("Failed to load orders")
      })
      .finally(() => {
        if (seq === snapshotSeq.current) {
          initialLoadDone.current = true
          setLoadingInitial(false)
          setLoadingFilter(false)
        }
      })
  }, [rebuild])

  useEffect(() => {
    loadSnapshot()
  }, [status, search, loadSnapshot])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !cursorRef.current) return
    const seq = snapshotSeq.current
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const page = await fetchOrders({
        status: statusRef.current,
        search: searchRef.current,
        cursor: cursorRef.current,
        limit: PAGE_SIZE,
      })
      if (seq !== snapshotSeq.current) return
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

  const ring = useCallback(() => {
    if (!bell.current) return
    bell.current.currentTime = 0
    bell.current.play().catch(() => {})
  }, [])

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

    return () => {
      window.removeEventListener("pointerdown", unlock)
    }
  }, [])

  const { status: connectionStatus } = useRealtime({
    channels: [`orders:${organizationId}`],
    events: ["order.created", "order.updated", "order.deleted"],
    onData({ event, data }) {
      const sseEvent = event.split(".")[1]
      let payload: OrdersEvent
      if (sseEvent === "deleted") {
        payload = { type: "deleted", data: data as { id: string } }
      } else {
        payload = { type: sseEvent as "created" | "updated", data: data as OrderResponse }
      }

      const store = storeRef.current
      let changed = false

      if (payload.type === "deleted") {
        changed = store.delete(payload.data.id)
      } else {
        const order = payload.data as OrderResponse
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
        if (payload.type !== "deleted") ring()
      }
      scheduleStatsRefresh()
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

  return {
    orders,
    stats,
    connected,
    error,
    hasMore,
    loadingInitial,
    loadingFilter,
    loadingMore,
    loadMore,
  }
}
