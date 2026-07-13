"use client"

import { createRealtime } from "@upstash/realtime/client"
import { z } from "zod"

const schema = {
  order: { created: z.any(), updated: z.any(), deleted: z.any() },
  table: { status: z.any(), deleted: z.any() },
  analytics: { updated: z.any() },
}

export const { useRealtime } = createRealtime<typeof schema>()
