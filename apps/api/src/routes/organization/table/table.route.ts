import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { tableLogic, tableEmitter } from "./table.logic.js"
import {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
} from "./table.validation.js"

export const tableRouter = new Hono<AppEnv>()

tableRouter.use(sessionMiddleware)

tableRouter.get("/", async (c) => {
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

  const result = await tableLogic.getAll(organizationId)
  return c.json(result)
})

tableRouter.get("/:id", async (c) => {
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

  const id = c.req.param("id")
  const result = await tableLogic.getById(id, organizationId)
  return c.json(result)
})

tableRouter.post(
  "/",
  zvalidator(createTableSchema),
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
    const result = await tableLogic.create(body, organizationId)
    return c.json(result)
  }
)

tableRouter.put(
  "/",
  zvalidator(updateTableSchema),
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
    const result = await tableLogic.update(body, organizationId)
    return c.json(result)
  }
)

tableRouter.delete("/:id", async (c) => {
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

  const id = c.req.param("id")
  const result = await tableLogic.delete(id, organizationId)
  return c.json(result)
})

tableRouter.patch(
  "/status",
  zvalidator(updateTableStatusSchema),
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
    const result = await tableLogic.updateStatus(body, organizationId)
    return c.json(result)
  }
)

tableRouter.get("/status/stream", async (c) => {
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

  const initialStatus = await tableLogic.getAllStatus(organizationId)
  if (initialStatus.status === "error") {
    return c.json(initialStatus, initialStatus.code as 404)
  }

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "init",
      data: JSON.stringify(initialStatus.data),
    })

    const listener = (data: {
      tableId: string
      number: number
      name: string | null
      status: string
      updatedAt: Date
    }) => {
      stream.writeSSE({
        event: "status",
        data: JSON.stringify(data),
      })
    }

    tableEmitter.on(`status:${organizationId}`, listener)

    stream.onAbort(() => {
      tableEmitter.off(`status:${organizationId}`, listener)
    })

    await new Promise<void>((resolve) => {
      stream.onAbort(() => resolve())
    })
  })
})
