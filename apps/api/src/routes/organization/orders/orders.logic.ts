import {
  and,
  eq,
  desc,
  sql,
  inArray,
  gte,
  lt,
  or,
  ilike,
  count,
} from "drizzle-orm"
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
import { organization } from "../../../core/db/schemas/auth.js"
import { realtime as _realtime } from "../../../lib/realtime.js"

function channel(name: string) {
  return _realtime?.channel(name)
}
import { menuItem, type Price } from "../../../core/db/schemas/menu.js"

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
    const tableChannel = channel(`table:${organizationId}`)
    await tableChannel?.emit("table.status", table)
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

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

type OrderRow = typeof order.$inferSelect

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url")
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8")
    const sep = raw.indexOf("|")
    if (sep === -1) return null
    const createdAt = new Date(raw.slice(0, sep))
    const id = raw.slice(sep + 1)
    if (Number.isNaN(createdAt.getTime()) || !id) return null
    return { createdAt, id }
  } catch {
    return null
  }
}

const EMPTY_STATS = {
  total: 0,
  pending: 0,
  confirmed: 0,
  preparing: 0,
  ready: 0,
  served: 0,
  completed: 0,
  cancelled: 0,
}

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

  getPaginated: async (
    organizationId: string,
    opts: {
      limit?: number
      cursor?: string | null
      status?: string | null
      search?: string | null
    } = {}
  ) => {
    if (!organizationId) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const limit = Math.min(
      Math.max(Math.trunc(opts.limit ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE
    )

    const conditions = [eq(order.organizationId, organizationId)]

    if (opts.status && opts.status !== "all") {
      conditions.push(eq(order.status, opts.status as OrderRow["status"]))
    }

    const search = opts.search?.trim()
    if (search) {
      const q = `%${search}%`
      conditions.push(
        or(
          ilike(order.invoiceNumber, q),
          ilike(order.tableNumber, q),
          ilike(order.customerName, q)
        )!
      )
    }

    const decoded = opts.cursor ? decodeCursor(opts.cursor) : null
    if (decoded) {
      conditions.push(
        or(
          lt(order.createdAt, decoded.createdAt),
          and(
            eq(order.createdAt, decoded.createdAt),
            lt(order.id, decoded.id)
          )
        )!
      )
    }

    const rows = await db
      .select()
      .from(order)
      .where(and(...conditions))
      .orderBy(desc(order.createdAt), desc(order.id))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows
    const last = data[data.length - 1]
    const nextCursor =
      hasMore && last ? encodeCursor(last.createdAt, last.id) : null

    return {
      status: "success" as const,
      code: HTTP_STATUS_CODES.OK,
      data: { data, nextCursor, hasMore },
    }
  },

  getStats: async (organizationId: string) => {
    if (!organizationId) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const rows = await db
      .select({ status: order.status, value: count() })
      .from(order)
      .where(eq(order.organizationId, organizationId))
      .groupBy(order.status)

    const stats = { ...EMPTY_STATS }
    for (const row of rows) {
      const n = Number(row.value)
      if (row.status in stats) {
        stats[row.status as keyof typeof stats] = n
      }
      stats.total += n
    }

    return { status: "success" as const, code: HTTP_STATUS_CODES.OK, data: stats }
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

    const oneAndHalfHoursAgo = new Date(Date.now() - 90 * 60 * 1000)

    const orders = await db
      .select()
      .from(order)
      .where(
        and(
          eq(order.organizationId, organizationId),
          eq(order.tableNumber, tableNumber),
          inArray(order.status, ACTIVE_ORDER_STATUSES),
          gte(order.createdAt, oneAndHalfHoursAgo)
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

    void redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

    const ordersChannel = channel(`orders:${organizationId}`)
    const orderChannel = channel(`order:${created.id}`)
    const analyticsChannel = channel(`analytics:${organizationId}`)
    void Promise.all([
      ordersChannel?.emit("order.created", created),
      orderChannel?.emit("order.created", created),
      analyticsChannel?.emit("analytics.updated", null),
    ])

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

    const incomingItems = body.items ?? []
    if (incomingItems.length === 0) {
      return {
        status: "error" as const,
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "At least one item is required",
      }
    }

    const menuItemIds = [...new Set(incomingItems.map((it) => it.menuItemId))]
    const menuItemRows = await db
      .select()
      .from(menuItem)
      .where(
        and(
          inArray(menuItem.id, menuItemIds),
          eq(menuItem.organizationId, organizationId)
        )
      )
    const menuItemMap = new Map(menuItemRows.map((mi) => [mi.id, mi]))
    const resolvePrice = (
      price: Price,
      variant?: string | null
    ): number | null => {
      if (variant === "half") return price.half
      if (variant === "full") return price.full
      if (price.full != null) return price.full
      if (price.half != null) return price.half
      return null
    }

    const resolvedIncoming: OrderItemJson[] = []
    for (const incoming of incomingItems) {
      const mi = menuItemMap.get(incoming.menuItemId)
      if (!mi) {
        return {
          status: "error" as const,
          code: HTTP_STATUS_CODES.BAD_REQUEST,
          message: `Menu item ${incoming.menuItemId} not found`,
        }
      }
      if (!mi.isAvailable) {
        return {
          status: "error" as const,
          code: HTTP_STATUS_CODES.BAD_REQUEST,
          message: `${mi.name} is currently unavailable`,
        }
      }
      const unitPrice = resolvePrice(mi.price, incoming.variant)
      if (unitPrice === null) {
        return {
          status: "error" as const,
          code: HTTP_STATUS_CODES.BAD_REQUEST,
          message: `Price not found for menu item ${incoming.menuItemId}`,
        }
      }
      resolvedIncoming.push({
        menuItemId: incoming.menuItemId,
        name: mi.name,
        variant: incoming.variant,
        quantity: incoming.quantity,
        unitPrice,
        logo: mi.image ?? null,
        notes: incoming.notes ?? null,
        preparationTime: mi.preparationTime ?? null,
      })
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
      const subtotal = +resolvedIncoming
        .reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
        .toFixed(2)
      const discount = body.discount ?? 0
      const taxableAmount = +(subtotal - discount).toFixed(2)
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

      return orderLogic.create({
        organizationId: body.organizationId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        tableNumber,
        items: resolvedIncoming,
        subtotal,
        discount,
        taxableAmount,
        gstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        roundOff,
        grandTotal,
        notes: body.notes,
        paymentMethod: body.paymentMethod,
      })
    }

    const merged: OrderItemJson[] = active.items.map((it) => ({ ...it }))
    for (const incoming of resolvedIncoming) {
      const idx = merged.findIndex(
        (it) =>
          it.menuItemId === incoming.menuItemId &&
          it.variant === incoming.variant
      )
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          quantity: merged[idx].quantity + incoming.quantity,
          unitPrice: incoming.unitPrice,
        }
      } else {
        merged.push(incoming)
      }
    }

    const subtotal = +merged
      .reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
      .toFixed(2)

    const discount = active.discount + (body.discount ?? 0)

    const taxableAmount = +(subtotal - discount).toFixed(2)
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
      const ordersChannel = channel(`orders:${organizationId}`)
      const orderChannel = channel(`order:${updated.id}`)
      const analyticsChannel = channel(`analytics:${organizationId}`)
      await Promise.all([
        ordersChannel?.emit("order.updated", updated),
        orderChannel?.emit("order.updated", updated),
        analyticsChannel?.emit("analytics.updated", null),
      ])
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

      void emitTableStatus(organizationId, updated.tableNumber)
    }

    void redisClient.del(`${ORDER_CACHE_PREFIX}${organizationId}:${body.id}`)
    void redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

    const ordersChannel = channel(`orders:${organizationId}`)
    const orderChannel = channel(`order:${updated.id}`)
    const analyticsChannel = channel(`analytics:${organizationId}`)
    void Promise.all([
      ordersChannel?.emit("order.updated", updated),
      orderChannel?.emit("order.updated", updated),
      analyticsChannel?.emit("analytics.updated", null),
    ])

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

    void emitTableStatus(organizationId, updated.tableNumber)

    void redisClient.del(`${ORDER_CACHE_PREFIX}${organizationId}:${id}`)
    void redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

    const ordersChannel = channel(`orders:${organizationId}`)
    const orderChannel = channel(`order:${updated.id}`)
    const analyticsChannel = channel(`analytics:${organizationId}`)
    void Promise.all([
      ordersChannel?.emit("order.updated", updated),
      orderChannel?.emit("order.updated", updated),
      analyticsChannel?.emit("analytics.updated", null),
    ])

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

    void redisClient.del(`${ORDER_CACHE_PREFIX}${organizationId}:${id}`)
    void redisClient.delPattern(`${ORDER_CACHE_PREFIX}all:${organizationId}`)

    const ordersChannel = channel(`orders:${organizationId}`)
    const orderChannel = channel(`order:${id}`)
    const analyticsChannel = channel(`analytics:${organizationId}`)
    void Promise.all([
      ordersChannel?.emit("order.deleted", { id }),
      orderChannel?.emit("order.deleted", { id }),
      analyticsChannel?.emit("analytics.updated", null),
    ])

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
