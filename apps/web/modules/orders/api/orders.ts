import api from "@/lib/axios"
import type {
  CreateOrderDto,
  UpdateOrderDto,
  OrderResponse,
  OrderPage,
  OrderStats,
} from "@workspace/shared/schemas/order/index"

export interface FetchOrdersParams {
  cursor?: string | null
  limit?: number
  status?: string | null
  search?: string | null
}

export async function fetchOrders(
  params: FetchOrdersParams = {}
): Promise<OrderPage> {
  const query: Record<string, string> = {}
  if (params.cursor) query.cursor = params.cursor
  if (params.limit) query.limit = String(params.limit)
  if (params.status && params.status !== "all") query.status = params.status
  if (params.search?.trim()) query.search = params.search.trim()

  const { data } = await api.get(`/organization/orders`, { params: query })
  return data.data
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const { data } = await api.get(`/organization/orders/stats`)
  return data.data
}

export async function fetchOrderById(
  id: string,
  organizationId: string
): Promise<OrderResponse> {
  const { data } = await api.get(`/organization/orders/${id}`, {
    params: { organizationId },
  })
  return data.data
}

export async function createOrder(
  body: CreateOrderDto
): Promise<OrderResponse> {
  const { data } = await api.post("/organization/orders", body)
  return data.data
}

export async function updateOrder(
  body: UpdateOrderDto
): Promise<OrderResponse> {
  const { data } = await api.put("/organization/orders", body)
  return data.data
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/organization/orders/${id}`)
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  organizationId: string
): Promise<OrderResponse> {
  const { data } = await api.patch(`/organization/orders/${orderId}/status`, {
    status,
  })
  return data.data
}

export async function generateInvoice(orderId: string, organizationId: string) {
  const { data } = await api.get(`/organization/orders/${orderId}/invoice`, {
    params: { organizationId },
  })
  return data.data
}
