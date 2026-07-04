import { z } from "zod"
import { TableStatus } from "../../enums/index.js"

export const TableSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string().nullable(),
  organizationId: z.string(),
  status: TableStatus,
  qrToken: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Table = z.infer<typeof TableSchema>
