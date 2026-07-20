"use client"

import Preloader from "@/components/preloader"
import {
  useQrSession,
  qrTokenStorage,
  SessionEndedError,
  type QrSessionData,
} from "@/hooks/use-qr-session"
import { useParams, useRouter } from "next/navigation"
import { createContext, useContext, useEffect } from "react"

interface TableContextProps {
  data: QrSessionData | undefined
  isPending: boolean
  error: Error | null
  token: string | undefined
}

const TableContext = createContext<TableContextProps | null>(null)

// Context comes from the server-side QR session (httpOnly cookie), not from
// decoding the URL token. No session → back to the scanner to re-prove
// physical presence.
export function TableProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token } = useParams<{ token: string }>()
  const { data: session, isPending, error } = useQrSession()

  useEffect(() => {
    if (!token) return
    qrTokenStorage.setRouteToken(token)
    // Scrub the token from the address bar and history: the visible URL
    // becomes "/", while the in-memory route (and client nav) keeps working.
    try {
      window.history.replaceState(window.history.state, "", "/")
    } catch {
      /* noop */
    }
  }, [token])

  useEffect(() => {
    if (isPending) return
    if (!session) {
      if (error instanceof SessionEndedError) {
        router.replace("/thank-you")
        return
      }
      if (token) qrTokenStorage.setPendingToken(token)
      router.replace("/")
    }
  }, [session, isPending, error, router, token])

  return (
    <TableContext.Provider value={{ data: session, isPending, error, token }}>
      {children}
      {isPending && <Preloader />}
    </TableContext.Provider>
  )
}

export const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context)
    throw new Error("useTableContext must be used within a TableProvider")
  return context
}
