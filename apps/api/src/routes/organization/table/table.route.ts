import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { tableLogic } from "./table.logic.js"
import {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
} from "./table.validation.js"
export const tableRouter = new Hono<AppEnv>()

tableRouter.get("/", sessionMiddleware, async (c) => {
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
  return c.json(result, result.code)
})

tableRouter.get("/:id", sessionMiddleware, async (c) => {
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
  const result = await tableLogic.getById(id, organizationId)
  return c.json(result, result.code)
})

tableRouter.post(
  "/",
  sessionMiddleware,
  zvalidator("json", createTableSchema),
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
    return c.json(result, result.code)
  }
)

tableRouter.put(
  "/",
  sessionMiddleware,
  zvalidator("json", updateTableSchema),
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
    return c.json(result, result.code)
  }
)

tableRouter.delete("/:id", sessionMiddleware, async (c) => {
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
  const result = await tableLogic.delete(id, organizationId)
  return c.json(result, 200)
})

tableRouter.patch(
  "/status",
  sessionMiddleware,
  zvalidator("json", updateTableStatusSchema),
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
    return c.json(result, result.code)
  }
)

tableRouter.post("/token", sessionMiddleware, async (c) => {
  const body = await c.req.raw.json()
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        message: "Unauthorized, organization ID is required",
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const result = await tableLogic.generateQrToken(body.tableId, organizationId)
  return c.json(result, result.code)
})

tableRouter.post("/token/regenerate", sessionMiddleware, async (c) => {
  const body = await c.req.raw.json()
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        message: "Unauthorized, organization ID is required",
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const result = await tableLogic.regenerateQrToken(
    body.tableId,
    organizationId
  )
  return c.json(result, result.code)
})

tableRouter.post("/:id/end-session", sessionMiddleware, async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        message: "Unauthorized, organization ID is required",
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const id = c.req.param("id")!
  const result = await tableLogic.endQrSessions(id, organizationId)
  return c.json(result, result.code)
})

tableRouter.get("/sessions/counts", sessionMiddleware, async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) {
    return c.json(
      {
        message: "Unauthorized, organization ID is required",
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const result = await tableLogic.getQrSessionCounts(organizationId)
  return c.json(result, result.code)
})

tableRouter.get("/token/decode", async (c) => {
  const token = c.req.query("token")
  if (!token) {
    return c.json(
      {
        message: "Token is required",
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }
  const result = await tableLogic.decodeQrToken(token)
  return c.json(result, result.code)
})
