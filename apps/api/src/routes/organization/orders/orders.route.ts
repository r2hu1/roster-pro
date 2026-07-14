import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { orderLogic } from "./orders.logic.js"
import {
  createOrderSchema,
  createTableOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from "./orders.validation.js"

export const orderRouter = new Hono<AppEnv>()

orderRouter.get("/", sessionMiddleware, async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Organization not found",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const limitRaw = c.req.query("limit")
  const result = await orderLogic.getPaginated(organizationId, {
    limit: limitRaw ? Number(limitRaw) : undefined,
    cursor: c.req.query("cursor") ?? null,
    status: c.req.query("status") ?? null,
    search: c.req.query("search") ?? null,
  })
  return c.json(result, result.code)
})

orderRouter.get("/stats", sessionMiddleware, async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Organization not found",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const result = await orderLogic.getStats(organizationId)
  return c.json(result, result.code)
})

orderRouter.get("/table/:tableId/active", async (c) => {
  const organizationId = c.req.query("organizationId")
  if (!organizationId) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "organizationId query parameter is required",
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }

  const tableId = c.req.param("tableId")!
  const result = await orderLogic.getActiveByTableId(tableId, organizationId)
  return c.json(result, result.code)
})

orderRouter.get("/:id", async (c) => {
  const organizationId = c.req.query("organizationId")
  if (!organizationId) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "organizationId query parameter is required",
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }

  const id = c.req.param("id")!
  const result = await orderLogic.getById(id, organizationId)
  return c.json(result, result.code)
})

orderRouter.post(
  "/table/:tableId",
  zvalidator("json", createTableOrderSchema),
  async (c) => {
    const tableId = c.req.param("tableId")!
    const body = c.req.valid("json")
    const result = await orderLogic.createOrAppend(tableId, body)
    return c.json(result, result.code)
  }
)

orderRouter.post("/", zvalidator("json", createOrderSchema), async (c) => {
  const body = c.req.valid("json")
  const result = await orderLogic.create(body)
  return c.json(result, result.code)
})

orderRouter.put(
  "/",
  sessionMiddleware,
  zvalidator("json", updateOrderSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    if (!organizationId) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Organization not found",
        },
        HTTP_STATUS_CODES.UNAUTHORIZED
      )
    }

    const body = c.req.valid("json")
    const result = await orderLogic.update(body, organizationId)
    return c.json(result, result.code)
  }
)

orderRouter.patch(
  "/:id/status",
  sessionMiddleware,
  zvalidator("json", updateOrderStatusSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    if (!organizationId) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Organization not found",
        },
        HTTP_STATUS_CODES.UNAUTHORIZED
      )
    }

    const id = c.req.param("id")!
    const { status } = c.req.valid("json")
    const result = await orderLogic.updateStatus(id, status, organizationId)
    return c.json(result, result.code)
  }
)

orderRouter.delete("/:id", sessionMiddleware, async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Organization not found",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const id = c.req.param("id")!
  const result = await orderLogic.delete(id, organizationId)
  return c.json(result)
})

orderRouter.get("/:orderId/invoice", async (c) => {
  const organizationId = c.req.query("organizationId")
  if (!organizationId) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Organization not found",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const orderId = c.req.param("orderId")!
  const result = await orderLogic.invoice(orderId, organizationId)
  return c.json(result)
})
