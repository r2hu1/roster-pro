import { z } from "zod"
import { MenuSchema } from "./base.js"

export const MenuResponseSchema = MenuSchema

export type MenuResponse = z.infer<typeof MenuResponseSchema>

export const MenuListResponseSchema = z.array(MenuSchema)

export type MenuListResponse = z.infer<typeof MenuListResponseSchema>
