import { z } from "zod"
import { TableStatus } from "../../enums"

export const UpdateTableSchema = z.object({
  id: z.string().min(1, "Table ID is required"),
  number: z.number().int().positive().optional(),
  name: z.string().nullable().optional(),
  status: TableStatus.optional(),
})

export type UpdateTableDto = z.infer<typeof UpdateTableSchema>

export const UpdateTableStatusSchema = z.object({
  id: z.string().min(1, "Table ID is required"),
  status: TableStatus,
})

export type UpdateTableStatusDto = z.infer<typeof UpdateTableStatusSchema>

export const DeleteTableSchema = z.object({
  id: z.string(),
})

export type DeleteTableDto = z.infer<typeof DeleteTableSchema>
