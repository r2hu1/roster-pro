"use client"

import { authClient } from "@/lib/better-auth/client"
import Transform from "@workspace/ui/components/transform"
import type { Session, User } from "better-auth"
import type { Organization } from "better-auth/client"
import { createContext, useContext } from "react"

interface SessionContextProps {
  session: Session | null
  user: User | null
  organization: Organization | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextProps | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: sessionIsPending } =
    authClient.useSession()

  const { data: organizations, isPending: organizationsIsPending } =
    authClient.useListOrganizations()

  const isLoading = sessionIsPending || organizationsIsPending

  return (
    <SessionContext.Provider
      value={{
        session: sessionData?.session ?? null,
        user: sessionData?.user ?? null,
        organization: organizations?.[0] ?? null,
        isLoading,
      }}
    >
      {children}

      {isLoading && (
        <div className="absolute bg-background z-100 flex inset-0 items-center justify-center">
          <div className="grid place-items-center space-y-3 text-center">
            <Transform className="size-10!" />
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
