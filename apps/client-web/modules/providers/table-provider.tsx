"use client"

import Preloader from "@/components/preloader"
import { useDecodeToken } from "@/hooks/use-decode-token"
import { DecodedToken } from "@workspace/shared/types/organization/table/token/types"
import { useParams } from "next/navigation"
import { createContext, useContext } from "react"

interface TableContextProps {
  data: DecodedToken | undefined
  isPending: boolean
  error: Error | null
}

const TableContext = createContext<TableContextProps | null>(null)

export function TableProvider({ children }: { children: React.ReactNode }) {
  const { token } = useParams<{ token: string }>()
  const { data: decodedToken, isPending, error } = useDecodeToken(token)

  return (
    <TableContext.Provider value={{ data: decodedToken, isPending, error }}>
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
