"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type {
  OrderResponse,
  OrderStats,
} from "@workspace/shared/schemas/order/index"
import { fetchOrders, fetchOrderStats } from "../api/orders"
import { channels as rtChannels } from "@workspace/shared/realtime"
import { useRealtime } from "@/lib/realtime-client"

type OrdersEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

const PAGE_SIZE = 9
const STATS_DEBOUNCE_MS = 400
const FILTER_DEBOUNCE_MS = 300

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
      .filter((v) => v !== null && v !== undefined && v !== "")
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

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const statusRef = useRef(status)
  const searchRef = useRef(search)
  statusRef.current = status
  searchRef.current = search

  const bell = useRef<HTMLAudioElement | null>(null)
  const statsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rebuild = useCallback(() => {
    if (!mountedRef.current) return
    setOrders(Array.from(storeRef.current.values()).sort(compareOrders))
  }, [])

  const refreshStats = useCallback(() => {
    fetchOrderStats()
      .then((s) => {
        if (mountedRef.current) setStats(s)
      })
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
        if (mountedRef.current) setHasMore(page.hasMore)
        rebuild()
        if (mountedRef.current) setError(null)
      })
      .catch(() => {
        if (seq === snapshotSeq.current && mountedRef.current) {
          setError("Failed to load orders")
        }
      })
      .finally(() => {
        if (seq === snapshotSeq.current) {
          initialLoadDone.current = true
          if (mountedRef.current) {
            setLoadingInitial(false)
            setLoadingFilter(false)
          }
        }
      })
  }, [rebuild])

  useEffect(() => {
    if (filterTimer.current) clearTimeout(filterTimer.current)
    filterTimer.current = setTimeout(loadSnapshot, FILTER_DEBOUNCE_MS)
    return () => {
      if (filterTimer.current) clearTimeout(filterTimer.current)
    }
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
      if (mountedRef.current) setHasMore(page.hasMore)
      rebuild()
    } catch {
      //
    } finally {
      loadingMoreRef.current = false
      if (mountedRef.current) setLoadingMore(false)
    }
  }, [rebuild])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])
  useEffect(() => {
    return () => {
      if (statsTimer.current) clearTimeout(statsTimer.current)
    }
  }, [])

  const ring = useCallback(() => {
    bell.current?.play().catch(() => {})
    if (bell.current) bell.current.currentTime = 0
  }, [])

  useEffect(() => {
    const audio = new Audio("/audios/bell.wav")
    bell.current = audio

    const unlock = async () => {
      try {
        audio.muted = true
        await audio.play()
        audio.pause()
        audio.currentTime = 0
        audio.muted = false
      } catch {
        //
      }
    }
    window.addEventListener("pointerdown", unlock, { once: true })

    return () => {
      window.removeEventListener("pointerdown", unlock)
      audio.pause()
      bell.current = null
    }
  }, [])

  const channels = useMemo(
    () => [rtChannels.orders(organizationId)],
    [organizationId]
  )
  const events = useMemo(
    () => ["order.created", "order.updated", "order.deleted"] as const,
    []
  )

  const { status: connectionStatus } = useRealtime({
    channels,
    events,
    onData({ event, data }) {
      const sseEvent = event.split(".")[1]
      let payload: OrdersEvent
      if (sseEvent === "deleted") {
        payload = { type: "deleted", data: data as { id: string } }
      } else {
        payload = {
          type: sseEvent as "created" | "updated",
          data: data as OrderResponse,
        }
      }

      const store = storeRef.current
      let changed = false
      let itemsAdded = false

      if (payload.type === "deleted") {
        changed = store.delete(payload.data.id)
      } else {
        const order = payload.data as OrderResponse
        const prev = store.get(order.id)
        itemsAdded =
          !!prev &&
          (order.items.length > prev.items.length ||
            order.items.some((n) => {
              const o = prev.items.find(
                (i) => i.menuItemId === n.menuItemId && i.variant === n.variant
              )
              return o && n.quantity > o.quantity
            }))
        const fits = matchesFilter(order, statusRef.current, searchRef.current)
        if (fits) {
          store.set(order.id, order)
          changed = true
        } else if (store.delete(order.id)) {
          changed = true
        }
      }

      if (changed) {
        rebuild()
        if (payload.type === "created" || itemsAdded) ring()
      }
      scheduleStatsRefresh()
    },
  })

  const wasConnected = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) return
    const isConnected = connectionStatus === "connected"
    setConnected(isConnected)
    if (isConnected) {
      setError(null)
      // On any reconnect after a drop, events missed while offline are gone —
      // reload the snapshot + stats so the view converges to server truth.
      if (wasConnected.current === false && initialLoadDone.current) {
        loadSnapshot()
        refreshStats()
      }
      wasConnected.current = true
    } else {
      if (connectionStatus === "error") setError("Connection lost")
      wasConnected.current = false
    }
  }, [connectionStatus, loadSnapshot, refreshStats])

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
