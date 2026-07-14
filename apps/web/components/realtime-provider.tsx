"use client"

import { RealtimeProvider } from "@upstash/realtime/client"

// Cap reconnect attempts so a prolonged outage doesn't turn every open tab into
// a permanent retry loop hammering the endpoint (thundering herd at scale).
const MAX_RECONNECT_ATTEMPTS = 20

export function Realtime({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider
      api={{ url: "/api/realtime", withCredentials: true }}
      maxReconnectAttempts={MAX_RECONNECT_ATTEMPTS}
    >
      {children}
    </RealtimeProvider>
  )
}
