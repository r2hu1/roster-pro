import type {
  CreateMenuDto,
  UpdateMenuDto,
} from "@workspace/shared/types/organization/menu/dto"
import type { MenuWithItemsResponse } from "@workspace/shared/schemas/menu/response"
import { and, eq } from "drizzle-orm"
import { db } from "../../../core/db/client.js"
import { menu, menuItem } from "../../../core/db/schemas/menu.js"
import { deleteFile } from "../../../core/imagekit/delete.js"
import { redisClient } from "../../../core/redis/client.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import { v4 as uuidv4 } from "uuid"

const MENU_CACHE_PREFIX = "menu:"
const MENU_ITEMS_CACHE_PREFIX = "menu_items:"
const CACHE_TTL = 300

export const menuLogic = {
  getAll: async (organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${MENU_CACHE_PREFIX}all:${organizationId}`
    const cached = await redisClient.get<(typeof menu.$inferSelect)[]>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const menus = await db
      .select()
      .from(menu)
      .where(eq(menu.organizationId, organizationId))

    await redisClient.set(cacheKey, menus, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: menus }
  },

  getById: async (id: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${MENU_CACHE_PREFIX}${organizationId}:${id}`
    const cached = await redisClient.get<typeof menu.$inferSelect>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const [found] = await db
      .select()
      .from(menu)
      .where(and(eq(menu.id, id), eq(menu.organizationId, organizationId)))

    if (!found) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu not found",
      }
    }

    await redisClient.set(cacheKey, found, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: found }
  },

  create: async (body: CreateMenuDto, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [created] = await db
      .insert(menu)
      .values({
        id: uuidv4(),
        organizationId,
        name: body.name,
        description: body.description ?? null,
        isActive: body.isActive ?? true,
      })
      .returning()

    await redisClient.del(`${MENU_CACHE_PREFIX}all:${organizationId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}with-items:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.CREATED, data: created }
  },

  update: async (body: UpdateMenuDto, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(menu)
      .where(and(eq(menu.id, body.id), eq(menu.organizationId, organizationId)))

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu not found",
      }
    }

    const [updated] = await db
      .update(menu)
      .set({
        name: body.name ?? existing.name,
        description:
          body.description !== undefined
            ? body.description
            : existing.description,
        isActive: body.isActive ?? existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(menu.id, body.id))
      .returning()

    await redisClient.del(`${MENU_CACHE_PREFIX}${organizationId}:${body.id}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}all:${organizationId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}with-items:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: updated }
  },

  getAllWithItems: async (organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${MENU_CACHE_PREFIX}with-items:${organizationId}`
    const cached = await redisClient.get<MenuWithItemsResponse[]>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const rows = await db
      .select()
      .from(menu)
      .leftJoin(menuItem, eq(menu.id, menuItem.menuId))
      .where(eq(menu.organizationId, organizationId))

    const menuMap = new Map<string, MenuWithItemsResponse>()

    for (const row of rows) {
      if (!menuMap.has(row.menu.id)) {
        menuMap.set(row.menu.id, {
          menu: row.menu.name,
          id: row.menu.id,
          items: [],
        })
      }
      if (row.menu_item) {
        menuMap.get(row.menu.id)!.items.push(row.menu_item)
      }
    }

    const data = Array.from(menuMap.values())

    await redisClient.set(cacheKey, data, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data }
  },

  delete: async (id: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(menu)
      .where(and(eq(menu.id, id), eq(menu.organizationId, organizationId)))

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu not found",
      }
    }

    const items = await db
      .select()
      .from(menuItem)
      .where(eq(menuItem.menuId, id))

    for (const item of items) {
      if (item.imageKey) {
        await deleteFile(item.imageKey)
      }
    }

    await db.delete(menuItem).where(eq(menuItem.menuId, id))
    await db.delete(menu).where(eq(menu.id, id))

    await redisClient.del(`${MENU_CACHE_PREFIX}${organizationId}:${id}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}all:${organizationId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}with-items:${organizationId}`)
    await redisClient.del(`${MENU_ITEMS_CACHE_PREFIX}all:${id}`)

    return { status: "success", code: HTTP_STATUS_CODES.OK }
  },
}
