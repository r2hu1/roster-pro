import { Hono } from "hono"
import type { AppEnv } from "../../index.js"
import { organizationLogic } from "./organization.logic.js"
import { sessionMiddleware } from "../../middleware/session.js"

export const organizationRouter = new Hono<AppEnv>()

organizationRouter.use(sessionMiddleware)

organizationRouter.get("/me", async (c) => {
  const headers = c.req.raw.headers;
  const result = await organizationLogic.me(headers);
  return c.json(result);
})
