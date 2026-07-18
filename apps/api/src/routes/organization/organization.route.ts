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
  const orgId = c.get("organizationId")!
  const result = await organizationLogic.me(orgId)
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

organizationRouter.put("/", sessionMiddleware, async (c) => {
  const headers = c.req.raw.headers

  let body: Record<string, unknown> = {}
  let file: File | undefined

  const contentType = c.req.header("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const parsed = await c.req.parseBody()
    file = parsed.logo instanceof File ? parsed.logo : undefined
    for (const [key, val] of Object.entries(parsed)) {
      if (key !== "logo" && typeof val === "string")
        body[key] = val === "" ? null : val
    }
    if (typeof body.hsnSac === "string") body.hsnSac = Number(body.hsnSac)
    if (typeof body.gstRate === "string") body.gstRate = Number(body.gstRate)
    if (body.name === null) delete body.name
  } else {
    try {
      body = await c.req.json()
    } catch {
      return c.json(
        { status: "error", code: 400, message: "Invalid JSON body" },
        400
      )
    }
  }

  const parsedResult = updateOrganizationSchema.safeParse(body)
  if (!parsedResult.success) {
    return c.json(
      {
        status: "error",
        code: 400,
        message: "Validation failed",
        errors: parsedResult.error.flatten().fieldErrors,
      },
      400
    )
  }

  const result = await organizationLogic.update(
    headers,
    parsedResult.data,
    file
  )
  return c.json(result, result.code)
})
