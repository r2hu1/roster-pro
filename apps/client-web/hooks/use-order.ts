"use client"

import { useQuery } from "@tanstack/react-query"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

type OrderResponseEnvelope =
  | { status: "success"; code: number; data: OrderResponse }
  | { status: "error"; code: number; message: string }

export function useOrder(
  orderId?: string | null,
  organizationId?: string | null
) {
  return useQuery({
    queryKey: ["order", organizationId, orderId],
    enabled: Boolean(orderId && organizationId),
    queryFn: async (): Promise<OrderResponse> => {
      const res = await api.get<OrderResponseEnvelope>(
        `organization/orders/${orderId}`,
        { params: { organizationId } }
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Order not found")
      }

      return res.data.data
    },
  })
}
