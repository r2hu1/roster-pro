import { cors } from "hono/cors"

const isProd = process.env.NODE_ENV === "production"

const allowedOrigins = new Set(
  [
    process.env.BETTER_AUTH_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? []),
  ]
    .map((o) => o?.trim().replace(/\/$/, ""))
    .filter((o): o is string => Boolean(o))
)

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return null

    const normalized = origin.replace(/\/$/, "")

    if (allowedOrigins.has(normalized)) return origin

    if (!isProd && /^http:\/\/localhost(:\d+)?$/.test(normalized)) return origin

    return null
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-API-KEY",
  ],
  credentials: true,
  maxAge: 86400,
})
