"use client"

import { createRealtime } from "@upstash/realtime/client"
import { realtimeSchema } from "@workspace/shared/realtime"

export const { useRealtime } = createRealtime<typeof realtimeSchema>()
