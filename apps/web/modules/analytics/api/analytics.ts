import api from "@/lib/axios"
import type { AnalyticsResponse } from "@workspace/shared/schemas/analytics/index"

export async function fetchAnalytics(from: string, to: string) {
  const req = await api.get("/organization/analytics", {
    params: { from, to },
  })
  return req.data.data as AnalyticsResponse
}
