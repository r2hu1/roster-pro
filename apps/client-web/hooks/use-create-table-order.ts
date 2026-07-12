"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateOrderDto,
  OrderResponse,
} from "@workspace/shared/schemas/order/index"
import api from "@/lib/axios"

export type CreateTableOrderInput = Omit<CreateOrderDto, "tableNumber">

type CreateTableOrderResponse =
  | { status: "success"; code: number; data: OrderResponse; appended?: boolean }
  | { status: "error"; code: number; message: string }

export function useCreateTableOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tableId,
      data,
    }: {
      tableId: string
      data: CreateTableOrderInput
    }): Promise<OrderResponse> => {
      const res = await api.post<CreateTableOrderResponse>(
        `organization/orders/table/${tableId}`,
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
