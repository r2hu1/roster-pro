import { createMiddleware } from "hono/factory"

export const apiKeyMiddleware = createMiddleware(async (c, next) => {
  const apiKey = c.req.header("x-api-key")

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return c.json({
      status: "error",
      code: 401,
      message: "Invalid API key",
    })
  }

  await next()
})
