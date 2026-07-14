"use client"

import { authClient } from "@/lib/better-auth/client"
import type { Session, User } from "better-auth"
import { createContext, useContext, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { OrganizationResponse } from "@workspace/shared/schemas/organization/response"
import { useRouter } from "next/navigation"
import Preloader from "@/components/preloader"

interface SessionContextProps {
  session: Session | null
  user: User | null
  organization: OrganizationResponse | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextProps | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const { data: sessionData, isPending: sessionIsPending } =
    authClient.useSession()

  const { data: organizations, isPending: organizationsIsPending } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await api.get("/organization")
      return data.data
    },
    staleTime: 5 * 50 * 1000,
    gcTime: 10 * 5 * 1000,
  })

  const isLoading = sessionIsPending || organizationsIsPending

  useEffect(() => {
    if (sessionIsPending) return
    if (!sessionData) {
      router.push("/")
    }
    if (organizationsIsPending) return
  }, [
    sessionData,
    sessionIsPending,
    organizations,
    organizationsIsPending,
    router,
  ])

  return (
    <SessionContext.Provider
      value={{
        session: sessionData?.session ?? null,
        user: sessionData?.user ?? null,
        organization: organizations ?? null,
        isLoading,
      }}
    >
      {children}

      {isLoading && <Preloader />}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }

  return context
}
