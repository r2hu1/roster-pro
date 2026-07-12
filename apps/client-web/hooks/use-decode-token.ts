"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import {
  DecodedToken,
  DecodeTokenEnvelope,
} from "@workspace/shared/types/organization/table/token/types"

export function useDecodeToken(token?: string | null) {
  return useQuery({
    queryKey: ["decode-token", token],
    enabled: !!token,
    queryFn: async (): Promise<DecodedToken> => {
      const res = await api.get<DecodeTokenEnvelope>(
        "organization/table/token/decode",
        { params: { token } }
      )

      if (res.data.status !== "success") {
        throw new Error(res.data.message ?? "Invalid QR token")
      }

      return res.data.data
    },
  })
}
