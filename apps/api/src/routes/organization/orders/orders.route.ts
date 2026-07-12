import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import type { AppEnv } from "../../../index.js"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { orderLogic, orderEmitter } from "./orders.logic.js"
import {
  createOrderSchema,
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

  const result = await orderLogic.getAll(organizationId)
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

  const initialOrders = await orderLogic.getAll(organizationId)
  if (initialOrders.status === "error") {
    return c.json(initialOrders, initialOrders.code as 404)
  }

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "init",
      data: JSON.stringify(initialOrders.data),
    })

    const listener = (event: {
      type: string
      data: OrderResponse | { id: string }
    }) => {
      stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event.data),
      })
    }

    orderEmitter.on(`orders:${organizationId}`, listener)

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "ping", data: "" }).catch(() => {})
    }, 30000)

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        orderEmitter.off(`orders:${organizationId}`, listener)
        clearInterval(heartbeat)
        resolve()
      })
    })
  })
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

  // Resolved once at connect; events are filtered against this number.
  const tableNumber = initial.tableNumber

  const isActive = (status: string) =>
    status !== "completed" && status !== "cancelled"

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "init",
      data: JSON.stringify(initial.data),
    })

    // Single subscription to the org-wide order channel; filter to this table.
    // No DB reads after init — every delta is derived from the emitted event.
    const listener = (event: {
      type: string
      data: OrderResponse | { id: string }
    }) => {
      if (event.type === "deleted") {
        stream.writeSSE({ event: "remove", data: JSON.stringify(event.data) })
        return
      }

      const o = event.data as OrderResponse
      if (o.tableNumber === tableNumber && isActive(o.status)) {
        // relevant + still active → client upserts
        stream.writeSSE({ event: "upsert", data: JSON.stringify(o) })
      } else {
        // wrong table or moved to completed/cancelled → client drops it
        stream.writeSSE({ event: "remove", data: JSON.stringify({ id: o.id }) })
      }
    }

    orderEmitter.on(`orders:${organizationId}`, listener)

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "ping", data: "" }).catch(() => {})
    }, 30000)

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        orderEmitter.off(`orders:${organizationId}`, listener)
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

    const listener = (event: {
      type: string
      data: OrderResponse | { id: string }
    }) => {
      stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event.data),
      })
    }

    orderEmitter.on(`order:${id}`, listener)

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "ping", data: "" }).catch(() => {})
    }, 30000)

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        orderEmitter.off(`order:${id}`, listener)
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
