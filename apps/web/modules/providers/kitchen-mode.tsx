"use client"

import React from "react"

interface KitchenModeContextType {
  kitchenMode: boolean
  setKitchenMode: React.Dispatch<React.SetStateAction<boolean>>
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
  const [kitchenMode, setKitchenMode] = React.useState(false)

  return (
    <KitchenModeContext.Provider value={{ kitchenMode, setKitchenMode }}>
      {children}
    </KitchenModeContext.Provider>
  )
}

export const useKitchenMode = () => React.useContext(KitchenModeContext)
