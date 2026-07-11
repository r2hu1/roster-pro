import api from "@/lib/axios"
import type { CreateTableDto } from "@workspace/shared/schemas/table/create"

import type { UpdateTableDto } from "@workspace/shared/schemas/table/update"

import type {
  TableResponse,
  TableListResponse,
} from "@workspace/shared/schemas/table/response"

export async function fetchTables(): Promise<TableListResponse> {
  const { data } = await api.get("/organization/table")
  return data.data
}

export async function fetchTableById(id: string): Promise<TableResponse> {
  const { data } = await api.get(`/organization/table/${id}`)
  return data.data
}

export async function createTable(
  body: CreateTableDto
): Promise<TableResponse> {
  const { data } = await api.post("/organization/table", body)
  return data.data
}

export async function updateTable(
  body: UpdateTableDto
): Promise<TableResponse> {
  const { data } = await api.put("/organization/table", body)
  return data.data
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/organization/table/${id}`)
}

export async function updateTableStatus(
  id: string,
  status: string
): Promise<TableResponse> {
  const { data } = await api.patch("/organization/table/status", { id, status })
  return data.data
}

export async function generateQrToken(
  tableId: string,
  tableNumber: number
): Promise<{ token: string }> {
  const { data } = await api.post("/organization/table/token", {
    tableId,
    tableNumber,
  })
  return data.data
}

export async function decodeQrToken(token: string) {
  const { data } = await api.get("/organization/table/token/decode", {
    params: { token },
  })
  return data.data
}
