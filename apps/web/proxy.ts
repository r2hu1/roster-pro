import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:3000"

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const path = request.nextUrl.pathname.replace("/api/", "")
    const apiUrl = `${API_URL}/v1/${path}${request.nextUrl.search}`

    const headers = new Headers()
    headers.set("x-api-key", process.env.API_KEY ?? "")

    const cookie = request.headers.get("cookie")
    if (cookie) headers.set("cookie", cookie)

    const contentType = request.headers.get("content-type")
    if (contentType) headers.set("content-type", contentType)

    return NextResponse.rewrite(apiUrl, { headers })
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
