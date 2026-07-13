export const runtime = "nodejs"

import { handle } from "@upstash/realtime"
import { realtime } from "@/lib/realtime-server"

const API_URL = process.env.API_URL ?? "http://localhost:3000"

async function validateSession(
  request: Request
): Promise<{ user: { id: string } } | null> {
  const cookie = request.headers.get("cookie")
  if (!cookie) return null

  try {
    const res = await fetch(`${API_URL}/v1/auth/session`, {
      headers: { cookie },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.user ? { user: { id: data.user.id } } : null
  } catch {
    return null
  }
}

if (!realtime) {
  console.warn("[realtime] Realtime not available — GET /api/realtime returns 503")
}

export const GET = realtime
  ? handle({
      realtime,
      middleware: async ({ request }) => {
        const session = await validateSession(request)
        if (!session) {
          return new Response("Unauthorized", { status: 401 })
        }
      },
    })
  : async () => new Response("Realtime unavailable", { status: 503 })
