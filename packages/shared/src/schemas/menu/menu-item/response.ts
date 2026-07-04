import { z } from "zod"
import { MenuItemSchema } from "./base.js"

export const MenuItemResponseSchema = MenuItemSchema

export type MenuItemResponse = z.infer<typeof MenuItemResponseSchema>

export const MenuItemListResponseSchema = z.array(MenuItemSchema)

export type MenuItemListResponse = z.infer<typeof MenuItemListResponseSchema>
