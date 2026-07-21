"use client"

import { useQuery } from "@tanstack/react-query"
import type { MenuWithItemsListResponse } from "@workspace/shared/schemas/menu/index"
import api from "@/lib/axios"

type MenusResponseEnvelope =
  | { status: "success"; code: number; data: MenuWithItemsListResponse }
  | { status: "error"; code: number; message: string }

export function useMenus(enabled = true) {
  return useQuery({
    queryKey: ["menus"],
    enabled,
    queryFn: async (): Promise<MenuWithItemsListResponse> => {
      const res = await api.get<MenusResponseEnvelope>("public/qr/menu")

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to load menus")
      }

      return res.data.data
    },
  })
}
