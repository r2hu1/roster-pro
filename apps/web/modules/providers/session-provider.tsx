"use client"

import { authClient } from "@/lib/better-auth/client"
import Transform from "@workspace/ui/components/transform"
import type { Session, User } from "better-auth"
import { createContext, useContext } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { OrganizationResponse } from "@workspace/shared/schemas/organization/response"

interface SessionContextProps {
  session: Session | null
  user: User | null
  organization: OrganizationResponse | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextProps | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: sessionIsPending } =
    authClient.useSession()

  const { data: organizations, isPending: organizationsIsPending } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await api.get("/organization")
      return data.data
    },
  })

  const isLoading = sessionIsPending || organizationsIsPending

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

      {isLoading && (
        <div className="fixed bg-background z-100 flex inset-0 items-center justify-center">
          <div className="grid place-items-center space-y-3 text-center">
            <Transform className="size-10! bg-foreground!" />
            <h1 className="text-foreground/80 w-[150px] text-sm">
              Preparing your workspace...
            </h1>
          </div>
        </div>
      )}
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
