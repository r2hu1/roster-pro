import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"
import { HTTP_STATUS_CODES } from "../../../lib/utils.js"
import { sessionMiddleware } from "../../../middleware/session.js"
import { analyticsLogic } from "./analytics.logic.js"
import { analyticsQuerySchema } from "./analytics.validation.js"

export const analyticsRouter = new Hono<AppEnv>()

analyticsRouter.get("/", sessionMiddleware, async (c) => {
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

  const from = c.req.query("from")
  const to = c.req.query("to")

  if (!from || !to) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "from and to query parameters are required",
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }

  const parsed = analyticsQuerySchema.safeParse({ from, to })
  if (!parsed.success) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: parsed.error.issues[0]?.message ?? "Invalid query parameters",
      },
      HTTP_STATUS_CODES.BAD_REQUEST
    )
  }

  const result = await analyticsLogic.get(organizationId, parsed.data)
  return c.json(result, result.code)
})
