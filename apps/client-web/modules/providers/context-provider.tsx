"use client"

import axios from "axios"
import React, { createContext, useContext, useState, useCallback } from "react"

import type { MenuItem } from "@workspace/shared/types/organization/menu/types"

type Table = {
  orgId: string
  orgName: string
  orgLogo: string
  orgAddress: string
  tableId: string
  tableNumber: number | null
}

type Category = {
  id: string
  name: string
}

type TableDataResponse = {
  table: Table
  menu: MenuItem[]
  category: Category[]
}

type ContextType = {
  getTableData: (id: string) => Promise<TableDataResponse>
  cache: TableDataResponse | null
}

const Context = createContext<ContextType | undefined>(undefined)

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<TableDataResponse | null>(null)

  const getTableData = useCallback(
    async (id: string): Promise<TableDataResponse> => {
      if (cache) {
        return cache
      }

      try {
        // console.log(id)
        // Decode token
        const tableRes = await axios.get(
          `/api/organization/table/token/decode?token=${id}`
        )

        // console.log(tableRes.data)

        if (tableRes.data?.code !== 200) {
          throw new Error(
            tableRes.data?.message ?? "Unable to fetch table information."
          )
        }

        const table: Table = {
          orgId: tableRes.data.data.organization.id,
          orgName: tableRes.data.data.organization.name,
          orgLogo: tableRes.data.data.organization.logo,
          orgAddress: tableRes.data.data.organization.address,
          tableId: tableRes.data.data.table.id,
          tableNumber: tableRes.data.data.table.number,
        }

        // console.log(table)

        // Fetch menu
        const menuRes = await axios.post("/api/organization/menu/all", {
          organizationId: table.orgId,
        })

        if (menuRes.data?.code !== 200) {
          throw new Error(menuRes.data?.message ?? "Unable to fetch menu.")
        }

        const categories: Category[] = []
        const menuItems: MenuItem[] = []

        for (const item of menuRes.data.data ?? []) {
          categories.push({
            id: item.id,
            name: item.menu,
          })

          for (const food of item.items ?? []) {
            if (!food.category) {
              food.category = item.menu
            }
            menuItems.push(food)
          }
        }

        const result: TableDataResponse = {
          table,
          menu: menuItems,
          category: categories,
        }

        
        setCache(result)
        // console.log(result)

        return result
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ??
              error.message ??
              "Network request failed."
          )
        }

        if (error instanceof Error) {
          throw error
        }

        throw new Error("Unknown error occurred.")
      }
    },
    [cache]
  )

  return (
    <Context.Provider value={{ getTableData, cache }}>
      {children}
    </Context.Provider>
  )
}

export function useContextValue() {
  const context = useContext(Context)

  if (!context) {
    throw new Error("useContextValue must be used within ContextProvider")
  }

  return context
}
