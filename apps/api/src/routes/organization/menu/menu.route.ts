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

menuRouter.get("/items/:menuId", async (c) => {
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

  const menuId = c.req.param("menuId")
  const result = await menuItemLogic.getAllItems(menuId, organizationId)
  return c.json(result)
})

menuRouter.get("/item/:id", async (c) => {
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
  const result = await menuItemLogic.getItemById(id, organizationId)
  return c.json(result)
})

menuRouter.post(
  "/item",
  zvalidator(createMenuItemSchema),
  async (c) => {
    const body = c.req.valid("json")
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

    let file: File | undefined
    const contentType = c.req.header("content-type")
    if (contentType?.includes("multipart/form-data")) {
      const parsed = await c.req.parseBody()
      const uploaded = parsed.image
      if (uploaded instanceof File) {
        file = uploaded
      }
    }

    const result = await menuItemLogic.createItem(organizationId, body, file)
    return c.json(result)
  }
)

menuRouter.put(
  "/item",
  zvalidator(updateMenuItemSchema),
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

    let file: File | undefined
    const contentType = c.req.header("content-type")
    if (contentType?.includes("multipart/form-data")) {
      const parsed = await c.req.parseBody()
      const uploaded = parsed.image
      if (uploaded instanceof File) {
        file = uploaded
      }
    }

    const result = await menuItemLogic.updateItem(organizationId, body, file)
    return c.json(result)
  }
)

menuRouter.delete("/item/:id", async (c) => {
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
  const result = await menuItemLogic.deleteItem(organizationId, id)
  return c.json(result)
})
