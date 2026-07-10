import type { Context } from "hono"
import type { AppEnv } from "../index.js"
import { auth } from "../lib/better-auth/auth.js"
import { HTTP_STATUS_CODES } from "@workspace/shared/constants"

const excludedPaths = ["/v1/auth/polar/webhooks"]

export const sessionMiddleware = async (
  c: Context<AppEnv>,
  next: () => Promise<void>
) => {
  if (excludedPaths.includes(c.req.path)) {
    await next()
    return
  }

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) {
    return c.json(
      {
        status: "error",
        data: null,
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  c.set("user", session?.user ?? null)
  c.set("session", session?.session ?? null)
  c.set("organizationId", session?.user.organizationId ?? null)

  await next()
}
