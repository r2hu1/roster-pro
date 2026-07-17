import type {
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from "@workspace/shared/types/organization/menu/dto"
import { and, eq } from "drizzle-orm"
import { db } from "../../../../core/db/client.js"
import { menu, menuItem } from "../../../../core/db/schemas/menu.js"
import { deleteFile } from "../../../../core/imagekit/delete.js"
import { uploadFile } from "../../../../core/imagekit/upload.js"
import { redisClient } from "../../../../core/redis/client.js"
import { HTTP_STATUS_CODES } from "../../../../lib/utils.js"

const MENU_ITEMS_CACHE_PREFIX = "menu_items:"
const MENU_CACHE_PREFIX = "menu:"
const CACHE_TTL = 300

export const menuItemLogic = {
  getAllItems: async (menuId: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${MENU_ITEMS_CACHE_PREFIX}all:${menuId}`
    const cached =
      await redisClient.get<(typeof menuItem.$inferSelect)[]>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const items = await db
      .select()
      .from(menuItem)
      .where(
        and(
          eq(menuItem.menuId, menuId),
          eq(menuItem.organizationId, organizationId)
        )
      )

    await redisClient.set(cacheKey, items, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: items }
  },

  getItemById: async (id: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${MENU_ITEMS_CACHE_PREFIX}${id}`
    const cached = await redisClient.get<typeof menuItem.$inferSelect>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const [found] = await db
      .select()
      .from(menuItem)
      .where(
        and(eq(menuItem.id, id), eq(menuItem.organizationId, organizationId))
      )

    if (!found) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu item not found",
      }
    }

    await redisClient.set(cacheKey, found, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: found }
  },

  createItem: async (
    organizationId: string,
    body: CreateMenuItemDto,
    file?: File
  ) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [menuExists] = await db
      .select()
      .from(menu)
      .where(
        and(eq(menu.id, body.menuId), eq(menu.organizationId, organizationId))
      )

    if (!menuExists) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu not found",
      }
    }

    let image: string | null = null
    let imageKey: string | null = null

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadResult = await uploadFile(buffer, file.name)
      if (uploadResult.status === "success") {
        image = uploadResult.url ?? null
        imageKey = uploadResult.id ?? null
      }
    }

    const [created] = await db
      .insert(menuItem)
      .values({
        menuId: body.menuId,
        organizationId,
        name: body.name,
        description: body.description ?? null,
        ingredients: body.ingredients ?? null,
        price: body.price,
        image,
        imageKey,
        category: body.category ?? null,
        isAvailable: body.isAvailable ?? true,
        isVegetarian: body.isVegetarian ?? false,
        preparationTime: body.preparationTime ?? null,
      })
      .returning()

    await redisClient.del(`${MENU_ITEMS_CACHE_PREFIX}all:${body.menuId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}all:${organizationId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}with-items:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.CREATED, data: created }
  },

  updateItem: async (
    organizationId: string,
    body: UpdateMenuItemDto,
    file?: File
  ) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(menuItem)
      .where(
        and(
          eq(menuItem.id, body.id),
          eq(menuItem.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu item not found",
      }
    }

    let image = existing.image
    let imageKey = existing.imageKey

    if (file) {
      if (existing.imageKey) {
        await deleteFile(existing.imageKey)
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadResult = await uploadFile(buffer, file.name)
      if (uploadResult.status === "success") {
        image = uploadResult.url ?? null
        imageKey = uploadResult.id ?? null
      }
    }

    const [updated] = await db
      .update(menuItem)
      .set({
        name: body.name ?? existing.name,
        description:
          body.description !== undefined
            ? body.description
            : existing.description,
        ingredients:
          body.ingredients !== undefined
            ? body.ingredients
            : existing.ingredients,
        price: body.price ?? existing.price,
        image,
        imageKey,
        category:
          body.category !== undefined ? body.category : existing.category,
        isAvailable: body.isAvailable ?? existing.isAvailable,
        isVegetarian: body.isVegetarian ?? existing.isVegetarian,
        preparationTime: body.preparationTime ?? existing.preparationTime,
        updatedAt: new Date(),
      })
      .where(eq(menuItem.id, body.id))
      .returning()

    await redisClient.del(`${MENU_ITEMS_CACHE_PREFIX}${body.id}`)
    await redisClient.del(`${MENU_ITEMS_CACHE_PREFIX}all:${existing.menuId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}all:${organizationId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}with-items:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: updated }
  },

  deleteItem: async (organizationId: string, id: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(menuItem)
      .where(
        and(eq(menuItem.id, id), eq(menuItem.organizationId, organizationId))
      )

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Menu item not found",
      }
    }

    if (existing.imageKey) {
      await deleteFile(existing.imageKey)
    }

    await db.delete(menuItem).where(eq(menuItem.id, id))

    await redisClient.del(`${MENU_ITEMS_CACHE_PREFIX}${id}`)
    await redisClient.del(`${MENU_ITEMS_CACHE_PREFIX}all:${existing.menuId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}all:${organizationId}`)
    await redisClient.del(`${MENU_CACHE_PREFIX}with-items:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.NO_CONTENT }
  },
}
