import { proxyRequest } from "@/lib/api-proxy"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return proxyRequest(request, await params)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return proxyRequest(request, await params)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return proxyRequest(request, await params)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return proxyRequest(request, await params)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return proxyRequest(request, await params)
}
