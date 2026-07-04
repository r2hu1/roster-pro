import { and, eq } from "drizzle-orm"
import { db } from "../../../core/db/client.js"
import { order } from "../../../core/db/schemas/order.js"
import { redisClient } from "../../../core/redis/client.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import type {
  CreateOrderDto,
  UpdateOrderDto,
} from "@workspace/shared/schemas/order/index"
import { EventEmitter } from "node:events"

const ORDER_CACHE_PREFIX = "order:"
const CACHE_TTL = 300

export const orderEmitter = new EventEmitter()
orderEmitter.setMaxListeners(100)

type OrderCreatedEvent = {
  type: "created"
  data: typeof order.$inferSelect
}

type OrderUpdatedEvent = {
  type: "updated"
  data: typeof order.$inferSelect
}

type OrderDeletedEvent = {
  type: "deleted"
  data: { id: string }
}

export type OrderEvent = OrderCreatedEvent | OrderUpdatedEvent | OrderDeletedEvent

export const orderLogic = {
  getAll: async (organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${ORDER_CACHE_PREFIX}all:${organizationId}`
    const cached = await redisClient.get<(typeof order.$inferSelect)[]>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const orders = await db
      .select()
      .from(order)
      .where(eq(order.organizationId, organizationId))

    await redisClient.set(cacheKey, orders, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: orders }
  },

  getById: async (id: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${ORDER_CACHE_PREFIX}${id}`
    const cached = await redisClient.get<typeof order.$inferSelect>(cacheKey)
    if (cached) {
      return { status: "success", code: HTTP_STATUS_CODES.OK, data: cached }
    }

    const [found] = await db
      .select()
      .from(order)
      .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))

    if (!found) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Order not found",
      }
    }

    await redisClient.set(cacheKey, found, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: found }
  },

  create: async (body: CreateOrderDto) => {
    const organizationId = body.organizationId
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [created] = await db
      .insert(order)
      .values({
        organizationId,
        customerName: body.customerName ?? null,
        customerPhone: body.customerPhone ?? null,
        customerEmail: body.customerEmail ?? null,
        tableNumber: body.tableNumber,
        status: body.status ?? "pending",
        paymentStatus: body.paymentStatus ?? "pending",
        totalAmount: body.totalAmount,
        notes: body.notes ?? null,
        items: body.items ?? null,
      })
      .returning()

    await redisClient.delPattern(`${ORDER_CACHE_PREFIX}*:${organizationId}`)

    orderEmitter.emit(`orders:${organizationId}`, {
      type: "created",
      data: created,
    } satisfies OrderCreatedEvent)

    orderEmitter.emit(`order:${created.id}`, {
      type: "created",
      data: created,
    } satisfies OrderCreatedEvent)

    return { status: "success", code: HTTP_STATUS_CODES.CREATED, data: created }
  },

  update: async (body: UpdateOrderDto, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [existing] = await db
      .select()
      .from(order)
      .where(and(eq(order.id, body.id), eq(order.organizationId, organizationId)))

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Order not found",
      }
    }

    const [updated] = await db
      .update(order)
      .set({
        customerName:
          body.customerName !== undefined ? body.customerName : existing.customerName,
        customerPhone:
          body.customerPhone !== undefined ? body.customerPhone : existing.customerPhone,
        customerEmail:
          body.customerEmail !== undefined ? body.customerEmail : existing.customerEmail,
        tableNumber: body.tableNumber ?? existing.tableNumber,
        status: body.status ?? existing.status,
        paymentStatus: body.paymentStatus ?? existing.paymentStatus,
        totalAmount: body.totalAmount ?? existing.totalAmount,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        items: body.items !== undefined ? body.items : existing.items,
        updatedAt: new Date(),
      })
      .where(eq(order.id, body.id))
      .returning()

    await redisClient.del(`${ORDER_CACHE_PREFIX}${body.id}`)
    await redisClient.delPattern(`${ORDER_CACHE_PREFIX}*:${organizationId}`)

    orderEmitter.emit(`orders:${organizationId}`, {
      type: "updated",
      data: updated,
    } satisfies OrderUpdatedEvent)

    orderEmitter.emit(`order:${updated.id}`, {
      type: "updated",
      data: updated,
    } satisfies OrderUpdatedEvent)

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
      .from(order)
      .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Order not found",
      }
    }

    await db.delete(order).where(eq(order.id, id))

    await redisClient.del(`${ORDER_CACHE_PREFIX}${id}`)
    await redisClient.delPattern(`${ORDER_CACHE_PREFIX}*:${organizationId}`)

    orderEmitter.emit(`orders:${organizationId}`, {
      type: "deleted",
      data: { id },
    } satisfies OrderDeletedEvent)

    orderEmitter.emit(`order:${id}`, {
      type: "deleted",
      data: { id },
    } satisfies OrderDeletedEvent)

    return { status: "success", code: HTTP_STATUS_CODES.NO_CONTENT }
  },
}
