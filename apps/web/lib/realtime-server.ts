import { Realtime } from "@upstash/realtime"
import { Redis } from "@upstash/redis"
import { realtimeSchema } from "@workspace/shared/realtime"

type Schema = typeof realtimeSchema

let realtimeInstance: Realtime<{ schema: Schema }> | null = null

function initRealtime() {
  if (realtimeInstance) return realtimeInstance

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      "[realtime] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — realtime features disabled"
    )
    return null
  }

  try {
    const redis = new Redis({ url, token })
    realtimeInstance = new Realtime({
      schema: realtimeSchema,
      redis,
    }) as unknown as Realtime<{ schema: Schema }>
    return realtimeInstance
  } catch (err) {
    console.error("[realtime] Failed to initialize Realtime:", err)
    return null
  }
}

const realtime = initRealtime()

export { realtime }
