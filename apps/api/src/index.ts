import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"
import { auth } from "./lib/better-auth/auth.js"
import { registerRoutes } from "./app.js"
import { routeLogger } from "./lib/logger.js"
import { corsMiddleware } from "./middleware/cors.js"
import { apiKeyMiddleware } from "./middleware/api.js"

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    organizationId: string | null
  }
}
export type AppHono = Hono<AppEnv>

const app = new Hono<AppEnv>()
  .basePath("/v1")
  .use(corsMiddleware)
  .use(apiKeyMiddleware)
  .on(["POST", "GET"], "/auth/*", async (c) => auth.handler(c.req.raw))
  .get("/status", (c) => {
    return c.json({
      status: "ok",
      code: 200,
      message: "Alive 👍!",
      timestamp: new Date().toISOString(),
    })
  })

registerRoutes(app)
routeLogger(app)

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)

export type AppRouter = typeof app
