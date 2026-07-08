export const runtime = "nodejs"

const API_URL = process.env.API_URL ?? "http://localhost:3000"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const backendUrl = `${API_URL}/v1/organization/analytics/stream?${searchParams}`

  const backendRes = await fetch(backendUrl, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  })

  if (!backendRes.ok) {
    return new Response(await backendRes.text(), {
      status: backendRes.status,
      headers: { "content-type": "application/json" },
    })
  }

  return new Response(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
