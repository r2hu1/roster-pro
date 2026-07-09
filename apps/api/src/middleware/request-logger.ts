import { randomUUID } from "node:crypto"

import chalk from "chalk"
import { createMiddleware } from "hono/factory"

import type { AppEnv } from "../index.js"

const statusColor = (status: number) => {
  if (status >= 500) return chalk.red
  if (status >= 400) return chalk.yellow
  if (status >= 300) return chalk.cyan
  if (status >= 200) return chalk.green
  return chalk.gray
}

const methodColor = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.green(method)
    case "POST":
      return chalk.blue(method)
    case "PUT":
      return chalk.yellow(method)
    case "PATCH":
      return chalk.magenta(method)
    case "DELETE":
      return chalk.red(method)
    default:
      return chalk.white(method)
  }
}

export const requestLogger = createMiddleware<AppEnv>(async (c, next) => {
  const requestId = c.req.header("x-request-id") ?? randomUUID()

  c.set("requestId", requestId)
  c.header("x-request-id", requestId)

  const start = performance.now()

  await next()

  const durationMs = Math.round(performance.now() - start)
  const status = c.res.status

  console.log(
    [
      chalk.gray("│"),
      statusColor(status)(String(status).padEnd(3)),
      methodColor(c.req.method.padEnd(6)),
      chalk.white(c.req.path.padEnd(40)),
      chalk.gray(`${durationMs.toString().padStart(4)} ms`),
      chalk.dim(`#${requestId.slice(0, 8)}`),
    ].join(" ")
  )
})
