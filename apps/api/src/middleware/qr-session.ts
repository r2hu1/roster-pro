import type { Context } from "hono"
import { getCookie } from "hono/cookie"
import type { AppEnv } from "../index.js"
import { HTTP_STATUS_CODES } from "../lib/utils.js"
import { qrSessionStore } from "../lib/qr-session.js"

export const QR_SESSION_COOKIE = "qr_session"

export function readQrCredential(c: Context<AppEnv>): string | null {
  const cookie = getCookie(c, QR_SESSION_COOKIE)
  if (cookie) return cookie
  const header = c.req.header("Authorization")
  if (header?.startsWith("Bearer ")) return header.slice(7)
  return null
}

export const qrSessionMiddleware = async (
  c: Context<AppEnv>,
  next: () => Promise<void>
) => {
  const credential = readQrCredential(c)
  if (!credential) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        errorCode: "SESSION_EXPIRED",
        message: "Scan the table QR code to start ordering",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  const result = await qrSessionStore.validate(credential)
  if (!result.ok) {
    return c.json(
      {
        status: "error",
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
        errorCode: result.reason,
        message: "Session expired, scan the table QR code again",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED
    )
  }

  c.set("qrSession", result.session)
  await next()
}
