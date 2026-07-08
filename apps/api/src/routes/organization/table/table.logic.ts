import { and, eq } from "drizzle-orm"
import type { TableStatus } from "@workspace/shared/enums/index"
import { db } from "../../../core/db/client.js"
import { tableSchema } from "../../../core/db/schemas/table.js"
import { redisClient } from "../../../core/redis/client.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import type {
  CreateTableDto,
  UpdateTableDto,
  UpdateTableStatusDto,
} from "@workspace/shared/schemas/table/index"
import { EventEmitter } from "node:events"
import { cryptoUtil } from "../../../lib/crypto.js"

const TABLE_CACHE_PREFIX = "table:"
const CACHE_TTL = 300

export const tableEmitter = new EventEmitter()
tableEmitter.setMaxListeners(100)

export const tableLogic = {
  getAll: async (organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${TABLE_CACHE_PREFIX}all:${organizationId}`
    const cached =
      await redisClient.get<(typeof tableSchema.$inferSelect)[]>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const tables = await db
      .select()
      .from(tableSchema)
      .where(eq(tableSchema.organizationId, organizationId))

    await redisClient.set(cacheKey, tables, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: tables }
  },

  getById: async (id: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${TABLE_CACHE_PREFIX}${id}`
    const cached =
      await redisClient.get<typeof tableSchema.$inferSelect>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const [found] = await db
      .select()
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, id),
          eq(tableSchema.organizationId, organizationId)
        )
      )

    if (!found) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Table not found",
      }
    }

    await redisClient.set(cacheKey, found, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: found }
  },

  create: async (body: CreateTableDto, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [created] = await db
      .insert(tableSchema)
      .values({
        organizationId,
        number: body.number,
        name: body.name ?? null,
        status: body.status ?? "available",
      })
      .returning()

    await redisClient.delPattern(`${TABLE_CACHE_PREFIX}*:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.CREATED, data: created }
  },

  update: async (body: UpdateTableDto, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, body.id),
          eq(tableSchema.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Table not found",
      }
    }

    const [updated] = await db
      .update(tableSchema)
      .set({
        number: body.number ?? existing.number,
        name: body.name !== undefined ? body.name : existing.name,
        status: body.status ?? existing.status,
        updatedAt: new Date(),
      })
      .where(eq(tableSchema.id, body.id))
      .returning()

    await redisClient.del(`${TABLE_CACHE_PREFIX}${body.id}`)
    await redisClient.delPattern(`${TABLE_CACHE_PREFIX}all:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: updated }
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
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, id),
          eq(tableSchema.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Table not found",
      }
    }

    await db.delete(tableSchema).where(eq(tableSchema.id, id))

    await redisClient.del(`${TABLE_CACHE_PREFIX}${id}`)
    await redisClient.delPattern(`${TABLE_CACHE_PREFIX}all:${organizationId}`)

    return { status: "success", code: HTTP_STATUS_CODES.NO_CONTENT }
  },

  updateStatus: async (body: UpdateTableStatusDto, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, body.id),
          eq(tableSchema.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Table not found",
      }
    }

    const [updated] = await db
      .update(tableSchema)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(tableSchema.id, body.id))
      .returning()

    await redisClient.del(`${TABLE_CACHE_PREFIX}${body.id}`)
    await redisClient.delPattern(`${TABLE_CACHE_PREFIX}all:${organizationId}`)

    tableEmitter.emit(`status:${organizationId}`, {
      id: updated.id,
      number: updated.number,
      name: updated.name,
      status: updated.status,
      updatedAt: updated.updatedAt,
    })

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: updated }
  },

  getAllStatus: async (organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const tables = await db
      .select({
        id: tableSchema.id,
        number: tableSchema.number,
        name: tableSchema.name,
        status: tableSchema.status,
        updatedAt: tableSchema.updatedAt,
      })
      .from(tableSchema)
      .where(eq(tableSchema.organizationId, organizationId))

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: tables }
  },
  generateQrToken: async (
    tableId: string,
    organizationId: string,
    tableNumber: string
  ) => {
    const encryptedToken = cryptoUtil.encrypt({
      tableId,
      tableNumber,
      organizationId,
    })
    if (!encryptedToken) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to generate QR token",
      }
    }
    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: encryptedToken,
    }
  },
  decodeQrToken: async (token: string) => {
    const decryptedToken = cryptoUtil.decrypt(token)
    if (!decryptedToken) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to decode QR token",
      }
    }
    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: decryptedToken,
    }
  },
}
