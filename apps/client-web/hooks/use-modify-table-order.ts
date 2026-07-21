"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

export interface ModifyTableOrderItem {
  menuItemId: string
  variant: "half" | "full"
  quantity: number
  notes?: string | null
}

type ModifyTableOrderResponse =
  | { status: "success"; code: number; data: OrderResponse }
  | { status: "error"; code: number; message: string }

export function useModifyTableOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      items,
    }: {
      orderId: string
      items: ModifyTableOrderItem[]
    }): Promise<OrderResponse> => {
      const res = await api.put<ModifyTableOrderResponse>(
        `public/qr/orders/${orderId}`,
        { items }
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to modify order")
      }

      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-orders"] })
    },
  })
}
