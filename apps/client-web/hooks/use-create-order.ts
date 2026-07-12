"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateOrderDto,
  OrderResponse,
} from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

type CreateOrderResponse =
  | { status: "success"; code: number; data: OrderResponse }
  | { status: "error"; code: number; message: string }

/**
 * Create an order. Invalidates active-orders queries on success so lists
 * refetch (the SSE stream also pushes the new order in realtime).
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateOrderDto): Promise<OrderResponse> => {
      const res = await api.post<CreateOrderResponse>(
        "organization/orders",
        payload
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to create order")
      }

      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-orders"] })
    },
  })
}
