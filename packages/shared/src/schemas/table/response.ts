import { z } from "zod"
import { TableSchema } from "./base.js"
import { TableStatus } from "../../enums"

export const TableResponseSchema = TableSchema

export type TableResponse = z.infer<typeof TableResponseSchema>

export const TableListResponseSchema = z.array(TableSchema)

export type TableListResponse = z.infer<typeof TableListResponseSchema>

export const TableStatusResponseSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string().nullable(),
  status: TableStatus,
  updatedAt: z.date(),
})

export type TableStatusResponse = z.infer<typeof TableStatusResponseSchema>
