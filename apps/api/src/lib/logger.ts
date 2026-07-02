import chalk from "chalk"
import type { AppHono } from "../index.js"

const methodColor: Record<string, (s: string) => string> = {
  GET: chalk.green,
  POST: chalk.blue,
  PUT: chalk.yellow,
  PATCH: chalk.hex("#ff8800"),
  DELETE: chalk.red,
}

export function routeLogger(app: AppHono) {
  const seen = new Set<string>()

  console.log("")
  console.log(chalk.bold("📦 Registered routes"))
  console.log("")

  for (const r of app.routes) {
    if (r.method === "ALL") continue
    if (r.path.endsWith("*")) continue

    const key = `${r.method} ${r.path}`
    if (seen.has(key)) continue
    seen.add(key)

    const color = methodColor[r.method] ?? chalk.gray

    const method = color(r.method.padEnd(6))
    const path = chalk.gray(r.path)

    console.log(`[${chalk.gray(path.split("/")[2])}] ${method} ${path}`)
  }

  console.log("")
}
