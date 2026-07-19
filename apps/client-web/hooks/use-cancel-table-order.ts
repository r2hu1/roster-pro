"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

type CancelTableOrderResponse =
  | { status: "success"; code: number; data: OrderResponse }
  | { status: "error"; code: number; message: string }

export function useCancelTableOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tableId,
      orderId,
      token,
    }: {
      tableId: string
      orderId: string
      token: string
    }): Promise<OrderResponse> => {
      const res = await api.patch<CancelTableOrderResponse>(
        `organization/orders/table/${tableId}/${orderId}/cancel`,
        { token }
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to cancel order")
      }

      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-orders"] })
    },
  })
}
