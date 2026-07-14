export const runtime = "nodejs"

import { handle } from "@upstash/realtime"
import { isChannelAuthorized } from "@workspace/shared/realtime"
import { realtime } from "@/lib/realtime-server"

const API_URL = process.env.API_URL ?? "http://localhost:3000"

if (!realtime) {
  console.warn(
    "[realtime] Realtime not available — GET /api/realtime returns 503"
  )
}

function unauthorized(message: string, status = 401) {
  return new Response(JSON.stringify({ status: "error", message }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

async function resolveOrganizationId(request: Request): Promise<string | null> {
  const cookie = request.headers.get("cookie")
  if (!cookie) return null

  try {
    const res = await fetch(`${API_URL}/v1/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      user?: { organizationId?: string | null } | null
    } | null
    return data?.user?.organizationId ?? null
  } catch (err) {
    console.error("[realtime] Session resolution failed:", err)
    return null
  }
}

const handler = realtime
  ? handle({
      realtime,
      middleware: async ({ request, channels }) => {
        const organizationId = await resolveOrganizationId(request)
        if (!organizationId) return unauthorized("Unauthorized")

        const forbidden = channels.filter(
          (channel) => !isChannelAuthorized(channel, organizationId)
        )
        if (forbidden.length > 0) {
          return unauthorized(
            `Forbidden channel(s): ${forbidden.join(", ")}`,
            403
          )
        }
      },
    })
  : async () => new Response("Realtime unavailable", { status: 503 })

export const GET = handler
