import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"
import { auth } from "./lib/better-auth/auth.js"
import { registerRoutes } from "./app.js"
import { closePool } from "./core/db/client.js"
import { routeLogger } from "./lib/logger.js"
import { corsMiddleware } from "./middleware/cors.js"
import { requestLogger } from "./middleware/request-logger.js"
import { onError, notFound } from "./middleware/error.js"

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    organizationId: string | null
    requestId: string
  }
}
export type AppHono = Hono<AppEnv>

const app = new Hono<AppEnv>()
  .basePath("/v1")
  .use(requestLogger)
  .use(corsMiddleware)
  .on(["POST", "GET"], "/auth/*", async (c) => auth.handler(c.req.raw))
  .get("/status", (c) => {
    return c.json(
      {
        status: "ok",
        code: 200,
        message: "Alive 👍!",
        timestamp: new Date().toISOString(),
      },
      200
    )
  })

app.onError(onError)
app.notFound(notFound)

registerRoutes(app)
routeLogger(app)

const server = serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)

let shuttingDown = false
const shutdown = async (signal: string) => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`Received ${signal}, shutting down...`)

  server.close(async () => {
    try {
      await closePool()
    } catch (err) {
      console.error("Error closing DB pool", err)
    }
    process.exit(0)
  })

  setTimeout(() => process.exit(1), 10000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

export type AppRouter = typeof app
