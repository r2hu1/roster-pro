"use client"

import Preloader from "@/components/preloader"
import { useDecodeToken } from "@/hooks/use-decode-token"
import { DecodedToken } from "@workspace/shared/types/organization/table/token/types"
import { useParams, useRouter } from "next/navigation"
import { createContext, useContext, useEffect } from "react"

interface TableContextProps {
  data: DecodedToken | undefined
  isPending: boolean
  error: Error | null
  token: string | undefined
}

const TableContext = createContext<TableContextProps | null>(null)

export function TableProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token } = useParams<{ token: string }>()
  const { data: decodedToken, isPending, error } = useDecodeToken(token)

  useEffect(() => {
    if (isPending) return
    if (!decodedToken) {
      router.push(`${process.env.NEXT_PUBLIC_MARKETING_URL}`)
    }
  }, [decodedToken, isPending, router])

  return (
    <TableContext.Provider
      value={{ data: decodedToken, isPending, error, token }}
    >
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
