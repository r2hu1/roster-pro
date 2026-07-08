import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { menuLogic } from "./menu.logic.js"
import { createMenuSchema, updateMenuSchema } from "./menu.validation.js"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { z } from "zod"

export const menuRouter = new Hono<AppEnv>()

menuRouter.get("/",sessionMiddleware, async (c) => {
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

menuRouter.post("/",sessionMiddleware, zvalidator("json", createMenuSchema), async (c) => {
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

menuRouter.put("/", zvalidator("json", updateMenuSchema), async (c) => {
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

menuRouter.post("/all-items", zvalidator("json", z.object({ organizationId: z.string().min(1) })), async (c) => {
  const { organizationId } = c.req.valid("json")
  const result = await menuLogic.getAllWithItems(organizationId)
  return c.json(result, result.code)
})

menuRouter.delete("/:id",sessionMiddleware, async (c) => {
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
  const result = await menuLogic.delete(id, organizationId)
  return c.json(result, result.code as ContentfulStatusCode)
})
