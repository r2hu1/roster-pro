"use client"

import { RealtimeProvider } from "@upstash/realtime/client"

export function Realtime({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider
      api={{ url: "/api/realtime" }}
      maxReconnectAttempts={10}
    >
      {children}
    </RealtimeProvider>
  )
}
