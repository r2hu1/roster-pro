import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { menuItemLogic } from "./menu-item/menu-item.logic.js"
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "./menu-item/menu-item.validation.js"
import { menuLogic } from "./menu.logic.js"
import { createMenuSchema, updateMenuSchema } from "./menu.validation.js"

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
  return c.json(result)
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
  return c.json(result)
})

menuRouter.post(
  "/",
  zvalidator(createMenuSchema),
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
    const result = await menuLogic.create(body, organizationId)
    return c.json(result)
  }
)

menuRouter.put(
  "/",
  zvalidator(updateMenuSchema),
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
    const result = await menuLogic.update(body, organizationId)
    return c.json(result)
  }
)

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
  return c.json(result)
})
