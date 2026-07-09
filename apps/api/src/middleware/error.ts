import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../index.js"
import { HTTP_STATUS_CODES } from "../lib/utils.js"

const isProd = process.env.NODE_ENV === "production"

export const onError = (err: Error, c: Context<AppEnv>) => {
  const requestId = c.get("requestId")

  if (err instanceof HTTPException) {
    console.warn(
      JSON.stringify({
        level: "warn",
        msg: "http_exception",
        requestId,
        status: err.status,
        error: err.message,
      })
    )
    return c.json(
      { status: "error", code: err.status, message: err.message, data:null },
      err.status
    )
  }

  console.error(
    JSON.stringify({
      level: "error",
      msg: "unhandled_error",
      requestId,
      path: c.req.path,
      method: c.req.method,
      error: err.message,
      stack: isProd ? undefined : err.stack,
    })
  )

  return c.json(
    {
      status: "error",
      code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      requestId,
      data: null,
    },
    HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  )
}

export const notFound = (c: Context<AppEnv>) =>
  c.json(
    {
      status: "error",
      code: HTTP_STATUS_CODES.NOT_FOUND,
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      data: null,
    },
    HTTP_STATUS_CODES.NOT_FOUND
  )
