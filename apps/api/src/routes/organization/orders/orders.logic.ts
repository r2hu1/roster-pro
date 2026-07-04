import { and, eq, desc, like, sql } from "drizzle-orm"
import { db } from "../../../core/db/client.js"
import { order, orderCounter } from "../../../core/db/schemas/order.js"
import { redisClient } from "../../../core/redis/client.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import type {
  CreateOrderDto,
  UpdateOrderDto,
} from "@workspace/shared/schemas/order/index"
import { EventEmitter } from "node:events"
import { organization } from "../../../core/db/schemas/auth.js"
import { analyticsEmitter } from "../analytics/analytics.logic.js"

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

export type OrderEvent =
  | OrderCreatedEvent
  | OrderUpdatedEvent
  | OrderDeletedEvent

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
    const cached =
      await redisClient.get<(typeof order.$inferSelect)[]>(cacheKey)
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

    const created = await db.transaction(async (tx) => {
      const year = new Date().getFullYear()
      const prefix = `INV-${year}-`

      const [counter] = await tx
        .insert(orderCounter)
        .values({ organizationId, year, lastSequence: 1 })
        .onConflictDoUpdate({
          target: [orderCounter.organizationId, orderCounter.year],
          set: { lastSequence: sql`${orderCounter.lastSequence} + 1` },
        })
        .returning()

      const invoiceNumber = `${prefix}${counter.lastSequence.toString().padStart(6, "0")}`

      const [result] = await tx
        .insert(order)
        .values({
          organizationId,
          invoiceNumber,
          customerName: body.customerName ?? null,
          customerPhone: body.customerPhone ?? null,
          customerEmail: body.customerEmail ?? null,
          tableNumber: body.tableNumber,
          status: body.status ?? "pending",
          paymentStatus: body.paymentStatus ?? "pending",
          paymentMethod: body.paymentMethod ?? null,
          items: body.items ?? [],
          subtotal: body.subtotal,
          discount: body.discount ?? 0,
          taxableAmount: body.taxableAmount,
          cgstAmount: body.cgstAmount ?? 0,
          sgstAmount: body.sgstAmount ?? 0,
          igstAmount: body.igstAmount ?? 0,
          roundOff: body.roundOff ?? 0,
          grandTotal: body.grandTotal,
          notes: body.notes ?? null,
        })
        .returning()

      return result
    })

    if (!created) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create order",
      }
    }

    try {
      await redisClient.delPattern(`${ORDER_CACHE_PREFIX}*:${organizationId}`)
    } catch (err) {
      console.error("Failed to invalidate order cache", err)
    }

    try {
      orderEmitter.emit(`orders:${organizationId}`, {
        type: "created",
        data: created,
      } satisfies OrderCreatedEvent)
      orderEmitter.emit(`order:${created.id}`, {
        type: "created",
        data: created,
      } satisfies OrderCreatedEvent)
      analyticsEmitter.emit(`analytics:${organizationId}`, {
        type: "updated",
        data: null,
      })
    } catch (err) {
      console.error("Failed to emit order events", err)
    }

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
      .where(
        and(eq(order.id, body.id), eq(order.organizationId, organizationId))
      )

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
          body.customerName !== undefined
            ? body.customerName
            : existing.customerName,
        customerPhone:
          body.customerPhone !== undefined
            ? body.customerPhone
            : existing.customerPhone,
        customerEmail:
          body.customerEmail !== undefined
            ? body.customerEmail
            : existing.customerEmail,
        tableNumber: body.tableNumber ?? existing.tableNumber,
        status: body.status ?? existing.status,
        paymentStatus: body.paymentStatus ?? existing.paymentStatus,
        paymentMethod:
          body.paymentMethod !== undefined
            ? body.paymentMethod
            : existing.paymentMethod,
        items: body.items !== undefined ? body.items : existing.items,
        subtotal: body.subtotal ?? existing.subtotal,
        discount: body.discount ?? existing.discount,
        taxableAmount: body.taxableAmount ?? existing.taxableAmount,
        cgstAmount: body.cgstAmount ?? existing.cgstAmount,
        sgstAmount: body.sgstAmount ?? existing.sgstAmount,
        igstAmount: body.igstAmount ?? existing.igstAmount,
        roundOff: body.roundOff ?? existing.roundOff,
        grandTotal: body.grandTotal ?? existing.grandTotal,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        updatedAt: new Date(),
      })
      .where(
        and(eq(order.id, body.id), eq(order.organizationId, organizationId))
      )
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

    analyticsEmitter.emit(`analytics:${organizationId}`, {
      type: "updated",
      data: null,
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
      .from(order)
      .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Order not found",
      }
    }

    await db
      .delete(order)
      .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))

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

    analyticsEmitter.emit(`analytics:${organizationId}`, {
      type: "updated",
      data: null,
    })

    return { status: "success", code: HTTP_STATUS_CODES.NO_CONTENT }
  },

  invoice: async (orderId: string, organizationId: string) => {
    const [existingOrder] = await db
      .select()
      .from(order)
      .where(
        and(eq(order.id, orderId), eq(order.organizationId, organizationId))
      )

    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))

    if (!org) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    if (!existingOrder) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Order not found",
      }
    }

    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: {
        invoiceNumber: existingOrder.invoiceNumber,
        issuedAt: existingOrder.createdAt,

        organization: {
          id: org.id,
          name: org.name,
          address: org.address,
          phone: org.phone,
          gstin: org.gstin,
        },

        customer: {
          name: existingOrder.customerName,
          email: existingOrder.customerEmail,
          phone: existingOrder.customerPhone,
          tableNumber: existingOrder.tableNumber,
        },

        items: existingOrder.items.map((item) => ({
          id: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),

        totals: {
          subtotal: existingOrder.subtotal,
          discount: existingOrder.discount,
          taxableAmount: existingOrder.taxableAmount,
          cgst: existingOrder.cgstAmount,
          sgst: existingOrder.sgstAmount,
          igst: existingOrder.igstAmount,
          roundOff: existingOrder.roundOff,
          grandTotal: existingOrder.grandTotal,
        },

        payment: {
          status: existingOrder.paymentStatus,
          method: existingOrder.paymentMethod,
        },

        notes: existingOrder.notes,
      },
    }
  },
}
