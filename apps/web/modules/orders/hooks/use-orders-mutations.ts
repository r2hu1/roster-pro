"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CreateOrderDto,
  UpdateOrderDto,
} from "@workspace/shared/schemas/order/index"
import { createOrder, updateOrder, deleteOrder } from "../api/orders"

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateOrderDto) => createOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateOrderDto) => updateOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
