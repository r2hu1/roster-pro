export const runtime = "nodejs"

import { handle } from "@upstash/realtime"
import { realtime } from "@/lib/realtime-server"

if (!realtime) {
  console.warn(
    "[realtime] Realtime not available — GET /api/realtime returns 503"
  )
}

export const GET = realtime
  ? handle({ realtime })
  : async () => new Response("Realtime unavailable", { status: 503 })
