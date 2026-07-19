"use client"

import { createContext, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import type { Session, User } from "better-auth"

import { authClient } from "@/lib/better-auth/client"
import api from "@/lib/axios"
import Preloader from "@/components/preloader"

import type { OrganizationResponse } from "@workspace/shared/schemas/organization/response"

interface SessionContextProps {
  session: Session | null
  user: User | null
  organization: OrganizationResponse | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextProps | null>(null)

interface SessionProviderProps {
  children: React.ReactNode
  enableOrganizations?: boolean
}

export function SessionProvider({
  children,
  enableOrganizations = true,
}: SessionProviderProps) {
  const router = useRouter()

  const {
    data: sessionData,
    isPending: sessionLoading,
  } = authClient.useSession()

  const {
    data: organization,
    isPending: organizationLoading,
  } = useQuery({
    queryKey: ["organization"],
    enabled: enableOrganizations && !!sessionData,
    queryFn: async () => {
      const { data } = await api.get("/organization")
      return data.data as OrganizationResponse
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const isLoading =
    sessionLoading || (enableOrganizations && organizationLoading)

  useEffect(() => {
    if (sessionLoading) return

    if (!sessionData) {
      router.replace("/")
    }
  }, [sessionLoading, sessionData, router])

  if (isLoading) {
    return <Preloader />
  }

  if (!sessionData) {
    return null
  }

  return (
    <SessionContext.Provider
      value={{
        session: sessionData.session,
        user: sessionData.user,
        organization: enableOrganizations ? organization ?? null : null,
        isLoading: false,
      }}
    >
      {children}
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
