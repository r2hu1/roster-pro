import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { menuLogic } from "./menu.logic.js"
import { createMenuSchema, updateMenuSchema } from "./menu.validation.js"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export const menuRouter = new Hono<AppEnv>()

menuRouter.use(sessionMiddleware)

menuRouter.get("/", async (c) => {
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

  const result = await menuLogic.getAll(organizationId)
  return c.json(result, result.code)
})

menuRouter.get("/:id", async (c) => {
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
  const result = await menuLogic.getById(id, organizationId)
  return c.json(result, result.code)
})

menuRouter.post("/", zvalidator(createMenuSchema), async (c) => {
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
  const result = await menuLogic.create(body, organizationId)
  return c.json(result, result.code)
})

menuRouter.put("/", zvalidator(updateMenuSchema), async (c) => {
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
  const result = await menuLogic.update(body, organizationId)
  return c.json(result, result.code)
})

menuRouter.delete("/:id", async (c) => {
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
  const result = await menuLogic.delete(id, organizationId)
  return c.json(result, result.code as ContentfulStatusCode)
})
