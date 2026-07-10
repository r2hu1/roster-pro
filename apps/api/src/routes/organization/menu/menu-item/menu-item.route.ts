import { Hono } from "hono"
import type { AppEnv } from "../../../../index.js"
import { HTTP_STATUS_CODES } from "../../../../lib/utils.js"
import { sessionMiddleware } from "../../../../middleware/session.js"
import { menuItemLogic } from "./menu-item.logic.js"
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "./menu-item.validation.js"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export const menuItemRouter = new Hono<AppEnv>()

menuItemRouter.get("/:menuId", sessionMiddleware, async (c) => {
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
  const result = await menuItemLogic.getAllItems(menuId!, organizationId)
  return c.json(result, result.code)
})

menuItemRouter.get("/:id", sessionMiddleware, async (c) => {
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
  const result = await menuItemLogic.getItemById(id, organizationId)
  return c.json(result, result.code)
})

menuItemRouter.post("/", sessionMiddleware, async (c) => {
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

  const contentType = c.req.header("content-type") || ""
  let body: Record<string, unknown>
  let file: File | undefined

  if (contentType.includes("multipart/form-data")) {
    const formData = await c.req.parseBody()
    file = formData.image instanceof File ? formData.image : undefined

    body = {
      menuId: formData.menuId as string,
      name: formData.name as string,
      description: (formData.description as string) || null,
      ingredients:
        (formData.ingredients as string)
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean) || null,
      price: {
        half: parseFloat((formData.price_half as string) || "0"),
        full: parseFloat((formData.price_full as string) || "0"),
      },
      isAvailable: formData.isAvailable === "true",
      isVegetarian: formData.isVegetarian === "true",
      preparationTime: formData.preparationTime ? parseFloat(formData.preparationTime as string) : null,
    }
  } else {
    body = await c.req.json()
  }

  const parsed = createMenuItemSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Validation failed",
        errors: parsed.error.issues,
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }

  const result = await menuItemLogic.createItem(
    organizationId,
    parsed.data,
    file
  )
  return c.json(result, result.code)
})

menuItemRouter.put("/", sessionMiddleware, async (c) => {
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

  const contentType = c.req.header("content-type") || ""
  let body: Record<string, unknown>
  let file: File | undefined

  if (contentType.includes("multipart/form-data")) {
    const formData = await c.req.parseBody()
    file = formData.image instanceof File ? formData.image : undefined

    body = {
      id: formData.id as string,
      name: formData.name as string,
      description: (formData.description as string) || null,
      ingredients:
        (formData.ingredients as string)
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean) || null,
      price: {
        half: parseFloat((formData.price_half as string) || "0"),
        full: parseFloat((formData.price_full as string) || "0"),
      },
      isAvailable: formData.isAvailable === "true",
      isVegetarian: formData.isVegetarian === "true",
    }
  } else {
    body = await c.req.json()
  }

  const parsed = updateMenuItemSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Validation failed",
        errors: parsed.error.issues,
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }

  const result = await menuItemLogic.updateItem(
    organizationId,
    parsed.data,
    file
  )
  return c.json(result, result.code)
})

menuItemRouter.delete("/:id", sessionMiddleware, async (c) => {
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
  const result = await menuItemLogic.deleteItem(organizationId, id)
  return c.json(result, result.code as ContentfulStatusCode)
})
