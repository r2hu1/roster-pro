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
import { publishTableEvent } from "../../../lib/realtime-events.js"
import { cryptoUtil } from "../../../lib/crypto.js"
import { organization } from "../../../core/db/schemas/auth.js"

const TABLE_CACHE_PREFIX = "table:"
const CACHE_TTL = 300

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

    const cacheKey = `${TABLE_CACHE_PREFIX}${organizationId}:${id}`
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

    publishTableEvent(organizationId, "table.status", {
      id: created.id,
      number: created.number,
      name: created.name,
      status: created.status,
      updatedAt: created.updatedAt,
    })

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

    await redisClient.del(`${TABLE_CACHE_PREFIX}${organizationId}:${body.id}`)
    await redisClient.del(`${TABLE_CACHE_PREFIX}all:${organizationId}`)

    publishTableEvent(organizationId, "table.status", {
      id: updated.id,
      number: updated.number,
      name: updated.name,
      status: updated.status,
      updatedAt: updated.updatedAt,
    })

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

    await redisClient.del(`${TABLE_CACHE_PREFIX}${organizationId}:${id}`)
    await redisClient.del(`${TABLE_CACHE_PREFIX}all:${organizationId}`)

    publishTableEvent(organizationId, "table.deleted", { id })

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

    await redisClient.del(`${TABLE_CACHE_PREFIX}${organizationId}:${body.id}`)
    await redisClient.del(`${TABLE_CACHE_PREFIX}all:${organizationId}`)

    publishTableEvent(organizationId, "table.status", {
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
  generateQrToken: async (tableId: string, organizationId: string) => {
    const [existingToken] = await db
      .select({ token: tableSchema.qrToken })
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, tableId),
          eq(tableSchema.organizationId, organizationId)
        )
      )

    if (existingToken?.token) {
      return {
        status: "success",
        code: HTTP_STATUS_CODES.OK,
        data: {
          token: existingToken.token,
        },
      }
    }

    const encryptedToken = cryptoUtil.encrypt({
      tableId,
      organizationId,
    })

    if (!encryptedToken) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to generate QR token",
      }
    }

    await db
      .update(tableSchema)
      .set({ qrToken: encryptedToken })
      .where(
        and(
          eq(tableSchema.id, tableId),
          eq(tableSchema.organizationId, organizationId)
        )
      )

    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: {
        token: encryptedToken,
      },
    }
  },
  decodeQrToken: async (token: string) => {
    const decryptedToken = cryptoUtil.decrypt<{
      organizationId: string
      tableId: string
    }>(token)
    if (!decryptedToken) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to decode QR token",
      }
    }
    const [table] = await db
      .select()
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, decryptedToken.tableId),
          eq(tableSchema.organizationId, decryptedToken.organizationId)
        )
      )

    if (!table) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Invalid QR code, table not found.",
      }
    }
    if (table.qrToken !== token) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Invalid QR code.",
      }
    }

    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, decryptedToken.organizationId))

    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: {
        organization: {
          id: org?.id,
          name: org?.name,
          logo: org?.logo,
          phone: org?.phone,
          address: org?.address,
        },
        table: {
          id: decryptedToken.tableId,
          name: table?.name,
          status: table?.status,
          number: table?.number,
        },
      },
    }
  },
}
