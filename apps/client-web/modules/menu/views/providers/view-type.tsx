"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ViewType = "list" | "grid"

interface ViewTypeContextProps {
  viewType: ViewType
  setViewType: (viewType: ViewType) => void
}

const ViewTypeContext = createContext<ViewTypeContextProps>({
  viewType: "list",
  setViewType: () => {},
})

export function ViewTypeProvider({ children }: { children: ReactNode }) {
  const [viewType, setViewType] = useState<ViewType>("list")

  return (
    <ViewTypeContext.Provider value={{ viewType, setViewType }}>
      {children}
    </ViewTypeContext.Provider>
  )
}

export function useViewType() {
  return useContext(ViewTypeContext)
}
