"use client"

import { useDecodeToken } from "@/hooks/use-decode-token"
import { DecodedToken } from "@workspace/shared/types/organization/table/token/types"
import Image from "next/image"
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
      {isPending && <div className="flex items-center justify-center z-999 fixed inset-0 bg-background">
        <div>
          <Image src="/assets/loading.svg" alt="Loading" height={100} className="size-50" width={100}/>
          <span className="sr-only">Loading...</span>
        </div>
      </div>}
    </TableContext.Provider>
  )
}

export const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context)
    throw new Error("useTableContext must be used within a TableProvider")
  return context
}
