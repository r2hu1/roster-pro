const API_BASE_URL = process.env.API_URL ?? "http://localhost:3000/v1"

function buildTargetUrl(path: string, searchParams: URLSearchParams): string {
  const url = new URL(`${API_BASE_URL}/${path}`)
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })
  return url.toString()
}

function buildForwardHeaders(requestHeaders: Headers, isSSE: boolean): Headers {
  const headers = new Headers()

  const cookie = requestHeaders.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const apiKey = process.env.API_KEY
  if (apiKey) headers.set("x-api-key", apiKey)

  const contentType = requestHeaders.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  const accept = requestHeaders.get("accept")
  if (accept) headers.set("accept", accept)

  if (isSSE) {
    headers.set("accept", "text/event-stream")
  }

  return headers
}

function isSSERequest(request: Request, path: string): boolean {
  const accept = request.headers.get("accept") ?? ""
  if (accept.includes("text/event-stream")) return true
  if (path.includes("/stream")) return true
  return false
}

async function proxyRequest(
  request: Request,
  params: { all: string[] }
): Promise<Response> {
  const path = params.all.join("/")
  const url = buildTargetUrl(path, new URL(request.url).searchParams)
  const isSSE = isSSERequest(request, path)
  const headers = buildForwardHeaders(request.headers, isSSE)

  const init: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const clone = request.clone()
    const body = await clone.arrayBuffer()
    if (body.byteLength > 0) {
      init.body = body
    }
  }

  try {
    const res = await fetch(url, init)

    if (isSSE && res.body) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      })
    }

    const responseHeaders = new Headers()
    res.headers.forEach((value, key) => {
      if (
        key === "content-type" ||
        key === "set-cookie" ||
        key.startsWith("x-")
      ) {
        responseHeaders.set(key, value)
      }
    })

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return Response.json(
      { status: "error", message: "Failed to connect to API server" },
      { status: 502 }
    )
  }
}

export { proxyRequest }
