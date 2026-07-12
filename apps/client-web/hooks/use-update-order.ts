"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  UpdateOrderDto,
  OrderResponse,
} from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

type UpdateOrderResponse =
  | { status: "success"; code: number; data: OrderResponse }
  | { status: "error"; code: number; message: string }

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateOrderDto): Promise<OrderResponse> => {
      const res = await api.put<UpdateOrderResponse>(
        "organization/orders",
        payload
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to update order")
      }

      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-orders"] })
    },
  })
}
