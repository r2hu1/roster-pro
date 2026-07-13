export const runtime = "nodejs"

import { handle } from "@upstash/realtime"
import { realtime } from "@/lib/realtime-server"

export const GET = handle({ realtime })
