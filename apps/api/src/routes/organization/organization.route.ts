import { Hono } from "hono"
import type { AppEnv } from "../../index.js"
import { organizationLogic } from "./organization.logic.js"
import { sessionMiddleware } from "../../middleware/session.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../lib/utils.js"
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "./organization.validation.js"

export const organizationRouter = new Hono<AppEnv>()

organizationRouter.get("/", sessionMiddleware, async (c) => {
  const headers = c.req.raw.headers
  const result = await organizationLogic.me(headers)
  return c.json(result, result.code)
})

organizationRouter.post(
  "/",
  sessionMiddleware,
  zvalidator("form", createOrganizationSchema),
  async (c) => {
    const headers = c.req.raw.headers
    const body = c.req.valid("form")

    let file: File | undefined
    const contentType = c.req.header("content-type")
    if (contentType?.includes("multipart/form-data")) {
      const parsed = await c.req.parseBody()
      const uploaded = parsed.logo
      if (uploaded instanceof File) {
        file = uploaded
      }
    }

    if (!file) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Logo file is required",
        },
        HTTP_STATUS_CODES.BAD_REQUEST
      )
    }

    const result = await organizationLogic.create(headers, body, file)
    return c.json(result, result.code)
  }
)

organizationRouter.put(
  "/",
  sessionMiddleware,
  zvalidator("json", updateOrganizationSchema),
  async (c) => {
    const headers = c.req.raw.headers
    const body = c.req.valid("json")

    let file: File | undefined
    const contentType = c.req.header("content-type")
    if (contentType?.includes("multipart/form-data")) {
      const parsed = await c.req.parseBody()
      const uploaded = parsed.logo
      if (uploaded instanceof File) {
        file = uploaded
      }
    }

    const result = await organizationLogic.update(headers, body, file)
    return c.json(result, result.code)
  }
)
