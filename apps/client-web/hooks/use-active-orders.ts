"use client"

import { useQuery } from "@tanstack/react-query"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

type ActiveOrdersResponse =
  | {
      status: "success"
      code: number
      data: OrderResponse[]
      tableSessionId: string | null
    }
  | { status: "error"; code: number; message: string }

export function useActiveOrders(enabled = true) {
  return useQuery({
    queryKey: ["active-orders"],
    enabled,
    queryFn: async (): Promise<{
      orders: OrderResponse[]
      tableSessionId: string | null
    }> => {
      const res = await api.get<ActiveOrdersResponse>("public/qr/orders/active")

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to load active orders")
      }

      return { orders: res.data.data, tableSessionId: res.data.tableSessionId }
    },
  })
}
