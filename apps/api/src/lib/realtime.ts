import { Realtime } from "@upstash/realtime"
import { Redis } from "@upstash/redis"
import { z } from "zod"

const schema = {
  order: { created: z.any(), updated: z.any(), deleted: z.any() },
  table: { status: z.any(), deleted: z.any() },
  analytics: { updated: z.any() },
}

let realtimeInstance: Realtime<{ schema: typeof schema }> | null = null

function initRealtime() {
  if (realtimeInstance) return realtimeInstance

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      "[realtime] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — realtime publish disabled"
    )
    return null
  }

  try {
    const redis = new Redis({ url, token })
    realtimeInstance = new Realtime({ schema, redis }) as unknown as Realtime<{ schema: typeof schema }>
    return realtimeInstance
  } catch (err) {
    console.error("[realtime] Failed to initialize:", err)
    return null
  }
}

const realtime = initRealtime()

export { realtime }
