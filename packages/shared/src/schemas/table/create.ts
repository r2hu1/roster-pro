import { z } from "zod"
import { TableStatus } from "../../enums/index.js"

export const CreateTableSchema = z.object({
  number: z.number().int().positive("Table number must be a positive integer"),
  name: z.string().nullable().optional(),
  status: TableStatus.optional(),
})

export type CreateTableDto = z.infer<typeof CreateTableSchema>

export const defaultCreateTable: z.input<typeof CreateTableSchema> = {
  number: 1,
}
