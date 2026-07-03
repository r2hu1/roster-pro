import { z } from "zod"

export const tableStatusEnum = z.enum(["available", "occupied"])

export const createTableSchema = z.object({
  number: z.number().int().positive("Table number must be a positive integer"),
  name: z.string().nullable().optional(),
  status: tableStatusEnum.optional(),
})

export const updateTableSchema = z.object({
  id: z.string().min(1, "Table ID is required"),
  number: z.number().int().positive().optional(),
  name: z.string().nullable().optional(),
  status: tableStatusEnum.optional(),
})

export const updateTableStatusSchema = z.object({
  id: z.string().min(1, "Table ID is required"),
  status: tableStatusEnum,
})

export type CreateTableDto = z.infer<typeof createTableSchema>
export type UpdateTableDto = z.infer<typeof updateTableSchema>
export type UpdateTableStatusDto = z.infer<typeof updateTableStatusSchema>
