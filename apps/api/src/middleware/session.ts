import type { Context } from "hono"
import type { AppEnv } from "../index.js"
import { auth } from "../lib/better-auth/auth.js"

const excludedPaths = ["/v1/auth/polar/webhooks", "v1/"]

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

  c.set("user", session?.user ?? null)
  c.set("session", session?.session ?? null)
  c.set("organizationId", session?.user.organizationId ?? null)

  await next()
}
