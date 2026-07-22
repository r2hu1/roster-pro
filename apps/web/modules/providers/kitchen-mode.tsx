"use client"

import { usePathname, useRouter } from "next/navigation"
import React, { useEffect } from "react"
import { useSession } from "./session-provider"
import { useQueryState, parseAsBoolean } from "nuqs"

interface KitchenModeContextType {
  kitchenMode: boolean
  setKitchenMode: (kitchenMode: boolean) => void
}

const KitchenModeContext = React.createContext<KitchenModeContextType>({
  kitchenMode: false,
  setKitchenMode: () => {},
})

export function KitchenModeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const path = usePathname()
  const { organization } = useSession()
  const router = useRouter()

  const [kitchenMode, setKitchenMode] = useQueryState(
    "kitchen",
    parseAsBoolean.withDefault(false)
  )

  useEffect(() => {
    if (path.split("/").length > 2) {
      if (!kitchenMode) return
      router.push(`/${organization?.id}`)
    }
  }, [kitchenMode, organization?.id, path, router])

  return (
    <KitchenModeContext.Provider value={{ kitchenMode, setKitchenMode }}>
      {children}
    </KitchenModeContext.Provider>
  )
}

export const useKitchenMode = () => React.useContext(KitchenModeContext)
