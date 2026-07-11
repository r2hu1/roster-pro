import api from "@/lib/axios"
import type {
  CreateOrderDto,
  UpdateOrderDto,
  OrderResponse,
  OrderListResponse,
} from "@workspace/shared/schemas/order/index"

export async function fetchOrders(
  organizationId: string
): Promise<OrderListResponse> {
  const { data } = await api.get(`/organization/orders`, {
    params: { organizationId },
  })
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
