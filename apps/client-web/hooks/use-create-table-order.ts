"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

export interface CreateTableOrderInput {
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  paymentMethod?: string | null
  discount?: number
  items: {
    menuItemId: string
    variant: "half" | "full"
    quantity: number
    notes?: string | null
  }[]
  notes?: string | null
}

type CreateTableOrderResponse =
  | { status: "success"; code: number; data: OrderResponse }
  | { status: "error"; code: number; message: string }

export function useCreateTableOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: CreateTableOrderInput
    }): Promise<OrderResponse> => {
      const res = await api.post<CreateTableOrderResponse>(
        "public/qr/orders",
        data
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to place order")
      }

      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-orders"] })
    },
  })
}
