import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import type { AppEnv } from "../../../index.js"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { orderLogic } from "./orders.logic.js"
import { realtime } from "../../../lib/realtime.js"
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

orderRouter.get("/stream", sessionMiddleware, async (c) => {
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

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: "ready", data: "" })

    const channel = realtime.channel(`orders:${organizationId}`)
    const unsubscribe = await channel.subscribe({
      events: ["order.created", "order.updated", "order.deleted"],
      onData({ event, data }) {
        const sseEvent = event.split(".")[1]
        stream.writeSSE({
          event: sseEvent,
          data: JSON.stringify(data),
        })
      },
    })

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "ping", data: "" }).catch(() => {})
    }, 30000)

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        unsubscribe()
        clearInterval(heartbeat)
        resolve()
      })
    })
  })
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

orderRouter.get("/table/:tableId/active/stream", async (c) => {
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
  const initial = await orderLogic.getActiveByTableId(tableId, organizationId)
  if (initial.status === "error") {
    return c.json(initial, initial.code as 404)
  }

  const tableNumber = initial.tableNumber

  const isActive = (status: string) =>
    status !== "completed" && status !== "cancelled"

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "init",
      data: JSON.stringify(initial.data),
    })

    const channel = realtime.channel(`orders:${organizationId}`)
    const unsubscribe = await channel.subscribe({
      events: ["order.created", "order.updated", "order.deleted"],
      onData({ event, data }) {
        const sseEvent = event.split(".")[1]

        if (sseEvent === "deleted") {
          stream.writeSSE({ event: "remove", data: JSON.stringify(data) })
          return
        }

        const o = data as OrderResponse
        if (o.tableNumber === tableNumber && isActive(o.status)) {
          stream.writeSSE({ event: "upsert", data: JSON.stringify(o) })
        } else {
          stream.writeSSE({ event: "remove", data: JSON.stringify({ id: o.id }) })
        }
      },
    })

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "ping", data: "" }).catch(() => {})
    }, 30000)

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        unsubscribe()
        clearInterval(heartbeat)
        resolve()
      })
    })
  })
})

orderRouter.get("/:id/stream", async (c) => {
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
  const existing = await orderLogic.getById(id, organizationId)
  if (existing.status === "error") {
    return c.json(existing, existing.code as 404)
  }

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "init",
      data: JSON.stringify(existing.data),
    })

    const channel = realtime.channel(`order:${id}`)
    const unsubscribe = await channel.subscribe({
      events: ["order.created", "order.updated", "order.deleted"],
      onData({ event, data }) {
        const sseEvent = event.split(".")[1]
        stream.writeSSE({
          event: sseEvent,
          data: JSON.stringify(data),
        })
      },
    })

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "ping", data: "" }).catch(() => {})
    }, 30000)

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        unsubscribe()
        clearInterval(heartbeat)
        resolve()
      })
    })
  })
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

orderRouter.post("/", zvalidator("json", createOrderSchema), async (c) => {
  // console.log("create order");     // ignore this
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
