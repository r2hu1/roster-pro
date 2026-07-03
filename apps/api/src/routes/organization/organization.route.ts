import { Hono } from "hono"
import type { AppEnv } from "../../index.js"
import { organizationLogic } from "./organization.logic.js"
import { sessionMiddleware } from "../../middleware/session.js"

export const organizationRouter = new Hono<AppEnv>()

organizationRouter.use(sessionMiddleware)

organizationRouter.get("/", async (c) => {
  const headers = c.req.raw.headers
  const result = await organizationLogic.me(headers)
  return c.json(result)
})

organizationRouter.put("/", async (c) => {
  const headers = c.req.raw.headers
  const { logo, logoKey, name, slug, metadata, websiteId, address } =
    await c.req.json()

  const body = {
    logo,
    logoKey,
    name,
    slug,
    metadata,
    websiteId,
    address,
  }

  const result = await organizationLogic.update(headers, body)
  return c.json(result)
})
