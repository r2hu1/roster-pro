import { headers } from "next/headers"

export async function GET() {
  const res = await fetch(`${process.env.API_URL}/organization/table/status/stream`, {
    headers: await headers(),
  })

  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const res = await fetch(`${process.env.API_URL}/organization/table/status`, {
    method: "PATCH",
    headers: await headers(),
    body: JSON.stringify(body),
  })

  return Response.json(await res.json())
}
