"use client"

import { createContext, useContext } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { useActiveOrdersStream } from "@/hooks/use-active-orders-stream"
import { useTableContext } from "@/modules/providers/table-provider"

interface OrdersStreamContextProps {
  orders: OrderResponse[]
  connected: boolean
  error: string | null
}

const OrdersStreamContext = createContext<OrdersStreamContextProps | null>(null)

export function OrdersStreamProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useTableContext()

  const { orders, connected, error } = useActiveOrdersStream(Boolean(session))

  return (
    <OrdersStreamContext.Provider value={{ orders, connected, error }}>
      {children}
    </OrdersStreamContext.Provider>
  )
}

export const useOrdersStream = () => {
  const ctx = useContext(OrdersStreamContext)
  if (!ctx)
    throw new Error("useOrdersStream must be used within OrdersStreamProvider")
  return ctx
}
