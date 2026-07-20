import { Hono } from "hono"
import { setCookie, deleteCookie } from "hono/cookie"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import type { AppEnv } from "../../../index.js"
import { db } from "../../../core/db/client.js"
import { tableSchema, tableSession } from "../../../core/db/schemas/table.js"
import { organization } from "../../../core/db/schemas/auth.js"
import { cryptoUtil } from "../../../lib/crypto.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import {
  qrSessionStore,
  QR_MAX_ACTIVE_SESSIONS_PER_TABLE,
  QR_SESSION_MAX_TTL_SEC,
} from "../../../lib/qr-session.js"
import {
  qrSessionMiddleware,
  QR_SESSION_COOKIE,
} from "../../../middleware/qr-session.js"
import { orderLogic } from "../../organization/orders/orders.logic.js"
import { menuLogic } from "../../organization/menu/menu.logic.js"

const createSessionSchema = z.object({
  qrToken: z.string().min(1, "qrToken is required"),
})

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  variant: z.enum(["half", "full"]),
  quantity: z.number().int().positive(),
  notes: z.string().nullable().optional(),
})

const createOrderSchema = z.object({
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().email().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  discount: z.number().min(0).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  notes: z.string().nullable().optional(),
})

const modifyOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
})

function clientIp(c: { req: { header: (name: string) => string | undefined } }) {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown"
  )
}

export const qrRouter = new Hono<AppEnv>()

qrRouter.post(
  "/session",
  zvalidator("json", createSessionSchema),
  async (c) => {
    const withinRate = await qrSessionStore.checkIssueRateLimit(clientIp(c))
    if (!withinRate) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
          message: "Too many attempts, try again shortly",
        },
        HTTP_STATUS_CODES.TOO_MANY_REQUESTS
      )
    }

    const { qrToken } = c.req.valid("json")
    const decoded = cryptoUtil.decrypt<{
      tableId: string
      organizationId: string
      v?: number
    }>(qrToken)
    if (!decoded) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Invalid or expired QR code",
        },
        HTTP_STATUS_CODES.UNAUTHORIZED
      )
    }

    const [table] = await db
      .select()
      .from(tableSchema)
      .where(
        and(
          eq(tableSchema.id, decoded.tableId),
          eq(tableSchema.organizationId, decoded.organizationId)
        )
      )

    // Token must be the table's current one; regeneration bumps the version
    // and rewrites qr_token, so stale printed codes fail here.
    if (
      !table ||
      table.qrToken !== qrToken ||
      (decoded.v ?? 1) !== (table.qrTokenVersion ?? 1)
    ) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Invalid or expired QR code",
        },
        HTTP_STATUS_CODES.UNAUTHORIZED
      )
    }

    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, decoded.organizationId))
    if (!org) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Organization not found",
        },
        HTTP_STATUS_CODES.NOT_FOUND
      )
    }

    const activeCount = await qrSessionStore.countActiveForTable(table.id)
    if (activeCount >= QR_MAX_ACTIVE_SESSIONS_PER_TABLE) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.FORBIDDEN,
          errorCode: "MAX_SESSIONS",
          message: "Too many devices at this table, ask the staff for help",
        },
        HTTP_STATUS_CODES.FORBIDDEN
      )
    }

    // Attach to the active tableSession, creating one if absent (same
    // seating-grouping rule createOrAppend uses).
    let [activeTableSession] = await db
      .select()
      .from(tableSession)
      .where(
        and(
          eq(tableSession.organizationId, decoded.organizationId),
          eq(tableSession.tableId, table.id),
          eq(tableSession.status, "active")
        )
      )
      .limit(1)

    if (!activeTableSession) {
      const [created] = await db
        .insert(tableSession)
        .values({
          organizationId: decoded.organizationId,
          tableId: table.id,
          tableNumber: String(table.number),
          status: "active",
        })
        .returning()
      activeTableSession = created
    }

    const { credential, expiresAt } = await qrSessionStore.create({
      organizationId: decoded.organizationId,
      tableId: table.id,
      tableNumber: String(table.number),
      tableSessionId: activeTableSession.id,
    })

    setCookie(c, QR_SESSION_COOKIE, credential, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: QR_SESSION_MAX_TTL_SEC,
    })

    return c.json(
      {
        status: "success",
        code: HTTP_STATUS_CODES.CREATED,
        data: {
          // credential also returned for clients that can't use the cookie
          // (cross-origin SSE); primary transport is the httpOnly cookie
          credential,
          expiresAt,
          organization: {
            name: org.name,
            logo: org.logo,
            phone: org.phone,
            address: org.address,
          },
          table: {
            name: table.name,
            number: table.number,
          },
        },
      },
      HTTP_STATUS_CODES.CREATED
    )
  }
)

qrRouter.get("/session", qrSessionMiddleware, async (c) => {
  const qrSession = c.get("qrSession")

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, qrSession.organizationId))
  const [table] = await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.id, qrSession.tableId))

  return c.json({
    status: "success",
    code: HTTP_STATUS_CODES.OK,
    data: {
      expiresAt: qrSession.createdAt + QR_SESSION_MAX_TTL_SEC * 1000,
      organization: {
        name: org?.name,
        logo: org?.logo,
        phone: org?.phone,
        address: org?.address,
      },
      table: {
        name: table?.name ?? null,
        number: Number(qrSession.tableNumber),
      },
    },
  })
})

qrRouter.delete("/session", qrSessionMiddleware, async (c) => {
  const qrSession = c.get("qrSession")
  await qrSessionStore.destroy(qrSession.sessionId, qrSession.tableId)
  deleteCookie(c, QR_SESSION_COOKIE, { path: "/" })
  return c.json({ status: "success", code: HTTP_STATUS_CODES.OK })
})

qrRouter.get("/menu", qrSessionMiddleware, async (c) => {
  const result = await menuLogic.getAllWithItems(
    c.get("qrSession").organizationId
  )
  return c.json(result, result.code)
})

qrRouter.post(
  "/orders",
  qrSessionMiddleware,
  zvalidator("json", createOrderSchema),
  async (c) => {
    const result = await orderLogic.createBySession(
      c.get("qrSession"),
      c.req.valid("json")
    )
    return c.json(result, result.code)
  }
)

qrRouter.get("/orders/active", qrSessionMiddleware, async (c) => {
  const result = await orderLogic.getActiveBySession(c.get("qrSession"))
  return c.json(result, result.code)
})

qrRouter.get("/orders/:orderId", qrSessionMiddleware, async (c) => {
  const result = await orderLogic.getByIdForSession(
    c.get("qrSession"),
    c.req.param("orderId")!
  )
  return c.json(result, result.code)
})

qrRouter.put(
  "/orders/:orderId",
  qrSessionMiddleware,
  zvalidator("json", modifyOrderSchema),
  async (c) => {
    const { items } = c.req.valid("json")
    const result = await orderLogic.modifyBySession(
      c.get("qrSession"),
      c.req.param("orderId")!,
      items
    )
    return c.json(result, result.code)
  }
)

qrRouter.patch("/orders/:orderId/cancel", qrSessionMiddleware, async (c) => {
  const result = await orderLogic.cancelBySession(
    c.get("qrSession"),
    c.req.param("orderId")!
  )
  return c.json(result, result.code)
})

qrRouter.get("/orders/:orderId/invoice", qrSessionMiddleware, async (c) => {
  const result = await orderLogic.invoiceForSession(
    c.get("qrSession"),
    c.req.param("orderId")!
  )
  return c.json(result, result.code)
})
