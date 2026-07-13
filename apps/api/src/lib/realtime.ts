import { Realtime } from "@upstash/realtime"
import { Redis } from "@upstash/redis"
import { z } from "zod"

const schema = {
  order: {
    created: z.any(),
    updated: z.any(),
    deleted: z.any(),
  },
  table: {
    status: z.any(),
    deleted: z.any(),
  },
  analytics: {
    updated: z.any(),
  },
}

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN")
}

const redis = new Redis({ url, token })

export const realtime = new Realtime({ schema, redis })
