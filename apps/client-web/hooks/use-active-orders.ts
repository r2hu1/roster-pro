"use client"

import { useQuery } from "@tanstack/react-query"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

type ActiveOrdersResponse =
  | { status: "success"; code: number; data: OrderResponse[] }
  | { status: "error"; code: number; message: string }

export function useActiveOrders(
  tableId?: string | null,
  organizationId?: string | null
) {
  return useQuery({
    queryKey: ["active-orders", organizationId, tableId],
    enabled: Boolean(tableId && organizationId),
    queryFn: async (): Promise<OrderResponse[]> => {
      const res = await api.get<ActiveOrdersResponse>(
        `organization/orders/table/${tableId}/active`,
        { params: { organizationId } }
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to load active orders")
      }

      return res.data.data
    },
  })
}
