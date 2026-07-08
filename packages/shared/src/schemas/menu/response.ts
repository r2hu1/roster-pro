import { z } from "zod"
import { MenuSchema } from "./base.js"
import { MenuItemSchema } from "./menu-item/base.js"

export const MenuResponseSchema = MenuSchema

export type MenuResponse = z.infer<typeof MenuResponseSchema>

export const MenuListResponseSchema = z.array(MenuSchema)

export type MenuListResponse = z.infer<typeof MenuListResponseSchema>

export const MenuWithItemsResponseSchema = z.object({
  menu: z.string(),
  id: z.string(),
  items: z.array(MenuItemSchema),
})

export type MenuWithItemsResponse = z.infer<typeof MenuWithItemsResponseSchema>

export const MenuWithItemsListResponseSchema = z.array(MenuWithItemsResponseSchema)

export type MenuWithItemsListResponse = z.infer<typeof MenuWithItemsListResponseSchema>
