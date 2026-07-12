import { and, eq, desc, like, sql, inArray, gte } from "drizzle-orm"
import { db } from "../../../core/db/client.js"
import {
  order,
  orderCounter,
  type OrderItemJson,
} from "../../../core/db/schemas/order.js"
import { tableSchema } from "../../../core/db/schemas/table.js"
import { redisClient } from "../../../core/redis/client.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import type {
  CreateOrderDto,
  UpdateOrderDto,
} from "@workspace/shared/schemas/order/index"
import type { CreateTableOrderDto } from "./orders.validation.js"
import { EventEmitter } from "node:events"
import { organization } from "../../../core/db/schemas/auth.js"
import { analyticsEmitter } from "../analytics/analytics.logic.js"
import { tableEmitter } from "../table/table.logic.js"

const TABLE_CACHE_PREFIX = "table:"

async function emitTableStatus(organizationId: string, tableNumber: string) {
  const [table] = await db
    .select({
      id: tableSchema.id,
      number: tableSchema.number,
      name: tableSchema.name,
      status: tableSchema.status,
      updatedAt: tableSchema.updatedAt,
    })
    .from(tableSchema)
    .where(
      and(
        eq(tableSchema.number, Number(tableNumber)),
        eq(tableSchema.organizationId, organizationId)
      )
    )

  if (table) {
    tableEmitter.emit(`table:${organizationId}`, {
      type: "status",
      data: table,
    })
  }

  try {
    await redisClient.delPattern(`${TABLE_CACHE_PREFIX}*:${organizationId}`)
  } catch (err) {
    console.error("Failed to invalidate table cache", err)
  }
}

const ORDER_CACHE_PREFIX = "order:"
const CACHE_TTL = 300

const ACTIVE_ORDER_WINDOW_MS = 2 * 60 * 60 * 1000

const ACTIVE_ORDER_STATUSES: (typeof order.$inferSelect)["status"][] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
]

export const orderEmitter = new EventEmitter()
orderEmitter.setMaxListeners(1000)

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
      .orderBy(desc(order.createdAt))

    await redisClient.set(cacheKey, orders, CACHE_TTL)

    return { status: "success", code: HTTP_STATUS_CODES.OK, data: orders }
  },

  resolveTableNumber: async (
    tableId: string,
    organizationId: string
  ): Promise<string | null> => {
    const [t] = await db
      .select({ number: tableSchema.number })
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, tableId),
          eq(tableSchema.organizationId, organizationId)
        )
      )
    return t ? String(t.number) : null
  },

  getActiveByTableId: async (tableId: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const tableNumber = await orderLogic.resolveTableNumber(
      tableId,
      organizationId
    )
    if (tableNumber === null) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Table not found",
      }
    }

    const orders = await db
      .select()
      .from(order)
      .where(
        and(
          eq(order.organizationId, organizationId),
          eq(order.tableNumber, tableNumber),
          inArray(order.status, ACTIVE_ORDER_STATUSES)
        )
      )
      .orderBy(desc(order.createdAt))

    return {
      status: "success" as const,
      code: HTTP_STATUS_CODES.OK,
      data: orders,
      tableNumber,
    }
  },

  getById: async (id: string, organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const cacheKey = `${ORDER_CACHE_PREFIX}${organizationId}:${id}`
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

      const taxableAmount = Number(body.taxableAmount)
      const gstRate = Number(org.gstRate ?? 5)

      const halfRate = gstRate / 2

      const cgstAmount = +((taxableAmount * halfRate) / 100).toFixed(2)
      const sgstAmount = +((taxableAmount * halfRate) / 100).toFixed(2)
      const igstAmount = 0

      const totalGst = cgstAmount + sgstAmount

      const roundOff = +(
        Math.round(taxableAmount + totalGst) -
        (taxableAmount + totalGst)
      ).toFixed(2)

      const grandTotal = +(taxableAmount + totalGst + roundOff).toFixed(2)

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
          taxableAmount,
          gstRate,
          cgstAmount,
          sgstAmount,
          igstAmount: 0,
          roundOff,
          grandTotal,
          notes: body.notes ?? null,
        })
        .returning()

      await tx
        .update(tableSchema)
        .set({ status: "occupied" })
        .where(
          and(
            eq(tableSchema.number, Number(body.tableNumber)),
            eq(tableSchema.organizationId, organizationId)
          )
        )

      return result
    })

    await emitTableStatus(organizationId, body.tableNumber)

    if (!created) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create order",
      }
    }

    try {
      await redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)
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

  createOrAppend: async (tableId: string, body: CreateTableOrderDto) => {
    const organizationId = body.organizationId
    if (!organizationId) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
    if (!org) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const tableNumber = await orderLogic.resolveTableNumber(
      tableId,
      organizationId
    )
    if (tableNumber === null) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Table not found",
      }
    }

    const windowStart = new Date(Date.now() - ACTIVE_ORDER_WINDOW_MS)
    const [active] = await db
      .select()
      .from(order)
      .where(
        and(
          eq(order.organizationId, organizationId),
          eq(order.tableNumber, tableNumber),
          inArray(order.status, ACTIVE_ORDER_STATUSES),
          gte(order.createdAt, windowStart)
        )
      )
      .orderBy(desc(order.createdAt))
      .limit(1)

    if (!active) {
      return orderLogic.create({ ...body, tableNumber })
    }

    const merged: OrderItemJson[] = active.items.map((it) => ({ ...it }))
    for (const incoming of body.items ?? []) {
      const idx = merged.findIndex(
        (it) =>
          it.menuItemId === incoming.menuItemId &&
          it.variant === incoming.variant
      )
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          quantity: merged[idx].quantity + incoming.quantity,
        }
      } else {
        merged.push({
          menuItemId: incoming.menuItemId,
          name: incoming.name,
          variant: incoming.variant,
          quantity: incoming.quantity,
          unitPrice: incoming.unitPrice,
          logo: incoming.logo ?? null,
          notes: incoming.notes ?? null,
        })
      }
    }

    const subtotal = active.subtotal + body.subtotal
    const discount = active.discount + (body.discount ?? 0)
    const taxableAmount = active.taxableAmount + body.taxableAmount

    const gstRate = active.gstRate
    const halfRate = gstRate / 2
    const cgstAmount = +((taxableAmount * halfRate) / 100).toFixed(2)
    const sgstAmount = +((taxableAmount * halfRate) / 100).toFixed(2)
    const totalGst = cgstAmount + sgstAmount
    const roundOff = +(
      Math.round(taxableAmount + totalGst) -
      (taxableAmount + totalGst)
    ).toFixed(2)
    const grandTotal = +(taxableAmount + totalGst + roundOff).toFixed(2)

    const [updated] = await db
      .update(order)
      .set({
        items: merged,
        subtotal,
        discount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        roundOff,
        grandTotal,
        updatedAt: new Date(),
      })
      .where(
        and(eq(order.id, active.id), eq(order.organizationId, organizationId))
      )
      .returning()

    try {
      await redisClient.del(
        `${ORDER_CACHE_PREFIX}${organizationId}:${active.id}`
      )
      await redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)
    } catch (err) {
      console.error("Failed to invalidate order cache", err)
    }

    try {
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
    } catch (err) {
      console.error("Failed to emit order events", err)
    }

    return {
      status: "success" as const,
      code: HTTP_STATUS_CODES.OK,
      data: updated,
      appended: true,
    }
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

    if (updated.status === "completed" || updated.status === "cancelled") {
      await db
        .update(tableSchema)
        .set({ status: "available" })
        .where(
          and(
            eq(tableSchema.number, Number(updated.tableNumber)),
            eq(tableSchema.organizationId, organizationId)
          )
        )

      await emitTableStatus(organizationId, updated.tableNumber)
    }

    await redisClient.del(`${ORDER_CACHE_PREFIX}${organizationId}:${body.id}`)
    await redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

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

  updateStatus: async (
    id: string,
    status: (typeof order.$inferSelect)["status"],
    organizationId: string
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
      .from(order)
      .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))

    if (!existing) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Order not found",
      }
    }

    const [updated] = await db
      .update(order)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))
      .returning()

    if (status === "completed" || status === "cancelled") {
      await db
        .update(tableSchema)
        .set({ status: "available" })
        .where(
          and(
            eq(tableSchema.number, Number(updated.tableNumber)),
            eq(tableSchema.organizationId, organizationId)
          )
        )
    } else {
      await db
        .update(tableSchema)
        .set({ status: "occupied" })
        .where(
          and(
            eq(tableSchema.number, Number(updated.tableNumber)),
            eq(tableSchema.organizationId, organizationId)
          )
        )
    }

    await emitTableStatus(organizationId, updated.tableNumber)

    await redisClient.del(`${ORDER_CACHE_PREFIX}${organizationId}:${id}`)
    await redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

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

    await redisClient.del(`${ORDER_CACHE_PREFIX}${organizationId}:${id}`)
    await redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

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
          hsnSac: org.hsnSac,
          gstRate: org.gstRate,
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
          logo: item.logo,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),

        totals: {
          subtotal: existingOrder.subtotal,
          discount: existingOrder.discount,
          taxableAmount: existingOrder.taxableAmount,
          gstRate: org.gstRate,
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
