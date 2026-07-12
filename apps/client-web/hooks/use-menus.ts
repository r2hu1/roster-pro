"use client"

import { useQuery } from "@tanstack/react-query"
import type { MenuWithItemsListResponse } from "@workspace/shared/schemas/menu/index"
import api from "@/lib/axios"

type MenusResponseEnvelope =
  | { status: "success"; code: number; data: MenuWithItemsListResponse }
  | { status: "error"; code: number; message: string }

export function useMenus(organizationId?: string | null) {
  return useQuery({
    queryKey: ["menus", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async (): Promise<MenuWithItemsListResponse> => {
      const res = await api.get<MenusResponseEnvelope>(
        `organization/menu/all/${organizationId}`
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Failed to load menus")
      }

      return res.data.data
    },
  })
}
