"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

export type QrSessionData = {
  expiresAt: number
  organization: {
    name: string | null
    logo: string | null
    phone: string | null
    address: string | null
  }
  table: {
    name: string | null
    number: number
  }
}

type SessionEnvelope =
  | { status: "success"; code: number; data: QrSessionData }
  | { status: "error"; code: number; errorCode?: string; message: string }

// Thrown when the server reports the session was deliberately ended
// (checkout, staff "end session", QR regeneration) rather than expired.
export class SessionEndedError extends Error {
  constructor() {
    super("Session ended")
    this.name = "SessionEndedError"
  }
}

const ROUTE_TOKEN_KEY = "qr-route-token"
const PENDING_TOKEN_KEY = "qr-pending-token"

// The route token is only a navigation key (which /{token} page to show);
// ordering authority lives in the httpOnly session cookie.
export const qrTokenStorage = {
  getRouteToken: () =>
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem(ROUTE_TOKEN_KEY),
  setRouteToken: (token: string) =>
    sessionStorage.setItem(ROUTE_TOKEN_KEY, token),
  clearRouteToken: () => sessionStorage.removeItem(ROUTE_TOKEN_KEY),
  getPendingToken: () =>
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem(PENDING_TOKEN_KEY),
  setPendingToken: (token: string) =>
    sessionStorage.setItem(PENDING_TOKEN_KEY, token),
  clearPendingToken: () => sessionStorage.removeItem(PENDING_TOKEN_KEY),
}

export function useQrSession() {
  return useQuery({
    queryKey: ["qr-session"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<QrSessionData> => {
      const res = await api.get<SessionEnvelope>("public/qr/session", {
        skipSessionRedirect: true,
        skipErrorToast: true,
        // treat 401 as data, not an axios error, so we can read errorCode
        validateStatus: (s) => s < 500,
      })

      if (res.data.status !== "success") {
        if (res.data.errorCode === "SESSION_ENDED") {
          throw new SessionEndedError()
        }
        throw new Error(res.data.message ?? "No active session")
      }

      return res.data.data
    },
  })
}

export function useCreateQrSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (qrToken: string): Promise<QrSessionData> => {
      const res = await api.post<SessionEnvelope>(
        "public/qr/session",
        { qrToken },
        { skipSessionRedirect: true, skipErrorToast: true }
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to start session")
      }

      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["qr-session"], data)
    },
  })
}
