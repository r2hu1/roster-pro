# API Integration Guide

How to integrate `@apps/api/` with the frontend apps (`@apps/web/` and `@apps/client-web/`).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Base URL & Headers](#base-url--headers)
- [Authentication](#authentication)
- [API Key](#api-key)
- [Request/Response Format](#requestresponse-format)
- [Available Endpoints](#available-endpoints)
- [Making API Calls](#making-api-calls)
- [SSE (Realtime) Integration](#sse-realtime-integration)
- [Using Shared Schemas](#using-shared-schemas)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)

---

## Architecture Overview

```
apps/web (Next.js :3001)  ──┐
                            ├──>  apps/api (Hono :3000)  ──>  PostgreSQL
apps/client-web (:3003)  ──┘
```

The API is a Hono server running on port 3000. Both frontend apps communicate with it over HTTP. The frontend apps proxy API requests through Next.js API routes (e.g. `/api/*` rewrites to `http://localhost:3000/v1/*`).

All request/response types are shared via `@workspace/shared` — the single source of truth for schemas, DTOs, and enums.

---

## Base URL & Headers

| Environment | Base URL |
|-------------|----------|
| Local | `http://localhost:3000/v1` |
| Production | `{BETTER_AUTH_URL}/v1` |

### Required Headers

Every request **must** include:

```
X-API-KEY: <your-api-key>
Content-Type: application/json
```

For authenticated endpoints, also include:

```
Cookie: <session-cookie>
```

The API uses cookie-based sessions via Better Auth. The session cookie is set automatically after Google OAuth login.

---

## Authentication

The API uses [Better Auth](https://www.better-auth.com/) with Google OAuth and cookie-based sessions.

### Auth Endpoints (proxied)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/auth/*` | Better Auth handlers (session, sign-in, etc.) |
| `POST` | `/v1/auth/*` | Better Auth handlers |

The frontend proxies these through Next.js API routes:

```
/apps/web/app/api/[...all]/route.ts  →  http://localhost:3000/v1/auth/*
```

### Session Flow

1. User clicks "Sign in with Google"
2. Better Auth redirects to Google OAuth
3. Google redirects back to `/v1/auth/callback/google`
4. Better Auth sets session cookies
5. Subsequent requests include cookies automatically

### Getting Current User

```ts
const res = await fetch("/api/user/me", { credentials: "include" })
const { data: user } = await res.json()
// user = { id, name, email, image, organizationId, ... }
```

---

## API Key

Every request requires an `X-API-KEY` header. The key is validated by the `apiKeyMiddleware` before any route handler runs.

```ts
fetch("/api/organization", {
  headers: {
    "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY,
  },
})
```

The API returns `401` with `"Invalid API key"` if missing or incorrect.

---

## Request/Response Format

### Standard Response Envelope

All endpoints return responses in this shape:

```jsonc
{
  "status": "success" | "error",
  "code": 200,
  "data": { ... },         // on success
  "message": "...",         // on error
  "errors": { ... }         // on validation error
}
```

### Validation Errors (400)

```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "price": ["Price must be positive"]
  }
}
```

### Unauthorized (401)

```json
{
  "status": "error",
  "code": 401,
  "message": "Invalid API key"
}
```

---

## Available Endpoints

### User

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/user/me` | Session | Get current user |
| `GET` | `/v1/user/organization` | Session | Get user's organization |

### Organization

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/organization` | Session | Get current organization |
| `POST` | `/v1/organization` | Session | Create organization (multipart: logo file) |
| `PUT` | `/v1/organization` | Session | Update organization (multipart: optional logo) |

### Menu

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/organization/menu` | Session | List all menus |
| `GET` | `/v1/organization/menu/:id` | Session | Get menu by ID |
| `POST` | `/v1/organization/menu` | Session | Create menu |
| `PUT` | `/v1/organization/menu` | Session | Update menu |
| `DELETE` | `/v1/organization/menu/:id` | Session | Delete menu |

### Menu Item

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/organization/menu/item/:menuId` | Session | List items for a menu |
| `GET` | `/v1/organization/menu/item/:id` | Session | Get menu item by ID |
| `POST` | `/v1/organization/menu/item` | Session | Create menu item (multipart: image) |
| `PUT` | `/v1/organization/menu/item` | Session | Update menu item (multipart: optional image) |
| `DELETE` | `/v1/organization/menu/item/:id` | Session | Delete menu item |

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/organization/orders` | Session | List all orders |
| `GET` | `/v1/organization/orders/:id` | Query: `organizationId` | Get order by ID |
| `POST` | `/v1/organization/orders` | None | Create order (public) |
| `PUT` | `/v1/organization/orders` | Session | Update order |
| `DELETE` | `/v1/organization/orders/:id` | Session | Delete order |
| `GET` | `/v1/organization/orders/stream` | Session | SSE: all orders realtime |
| `GET` | `/v1/organization/orders/:id/stream` | Query: `organizationId` | SSE: single order realtime |

### Tables

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/organization/table` | Session | List all tables |
| `GET` | `/v1/organization/table/:id` | Session | Get table by ID |
| `POST` | `/v1/organization/table` | Session | Create table |
| `PUT` | `/v1/organization/table` | Session | Update table |
| `DELETE` | `/v1/organization/table/:id` | Session | Delete table |
| `PATCH` | `/v1/organization/table/status` | Session | Update table status |
| `GET` | `/v1/organization/table/status/stream` | Session | SSE: table status realtime |
| `POST` | `/v1/organization/table/token` | Session | Generate QR token for table |

### Status

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/status` | API Key | Health check |

---

## Making API Calls

### 1. Setup: Next.js API Proxy

Add a catch-all route in each frontend app to proxy requests to the API:

```ts
// apps/web/app/api/[...all]/route.ts
const API_BASE = process.env.API_URL ?? "http://localhost:3000/v1"

async function proxyRequest(request: Request, params: { all: string[] }) {
  const path = params.all.join("/")
  const url = `${API_BASE}/${path}`

  const headers = new Headers()
  // Forward cookies for session auth
  const cookie = request.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("x-api-key", process.env.API_KEY ?? "")
  headers.set("content-type", request.headers.get("content-type") ?? "application/json")

  const init: RequestInit = {
    method: request.method,
    headers,
  }

  // Forward body for non-GET/HEAD requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body
    // @ts-expectable ReadableStream
    init duplex = "half"
  }

  const res = await fetch(url, init)

  // Stream the response back
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  })
}

export async function GET(request: Request, { params }: { params: { all: string[] } }) {
  return proxyRequest(request, await params)
}
export async function POST(request: Request, { params }: { params: { all: string[] } }) {
  return proxyRequest(request, await params)
}
export async function PUT(request: Request, { params }: { params: { all: string[] } }) {
  return proxyRequest(request, await params)
}
export async function DELETE(request: Request, { params }: { params: { all: string[] } }) {
  return proxyRequest(request, await params)
}
export async function PATCH(request: Request, { params }: { params: { all: string[] } }) {
  return proxyRequest(request, await params)
}
```

### 2. Environment Variables

```env
# apps/web/.env.local
API_URL=http://localhost:3000/v1
API_KEY=your-api-key-here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Fetch Wrapper (Recommended)

Create a typed fetch helper:

```ts
// apps/web/lib/api.ts
import type { HTTP_STATUS_CODES } from "@workspace/shared/constants"

const BASE_URL = "/api"

type ApiResponse<T> = {
  status: "success" | "error"
  code: number
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export async function api<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  return res.json()
}

export function apiGet<T>(path: string) {
  return api<T>(path)
}

export function apiPost<T>(path: string, body: unknown) {
  return api<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function apiPut<T>(path: string, body: unknown) {
  return api<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function apiDelete<T>(path: string) {
  return api<T>(path, { method: "DELETE" })
}

export function apiPatch<T>(path: string, body: unknown) {
  return api<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}
```

### 4. Usage Examples

```ts
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import type { MenuResponse } from "@workspace/shared/schemas/menu/index"
import type { CreateMenuDto } from "@workspace/shared/schemas/menu/index"

// GET - List menus
const menus = await apiGet<MenuResponse[]>("/organization/menu")

// GET - Single menu
const menu = await apiGet<MenuResponse>("/organization/menu/clxxxxx")

// POST - Create menu
const newMenu = await apiPost<MenuResponse>("/organization/menu", {
  name: "Lunch Menu",
  description: "Available 11am - 2pm",
} satisfies CreateMenuDto)

// PUT - Update menu
const updated = await apiPut<MenuResponse>("/organization/menu", {
  id: "clxxxxx",
  name: "Dinner Menu",
})

// DELETE - Delete menu
await apiDelete(`/organization/menu/clxxxxx`)
```

---

## SSE (Realtime) Integration

The API uses Server-Sent Events for realtime updates on orders and table status.

### SSE Endpoints

| Endpoint | Events | Description |
|----------|--------|-------------|
| `GET /v1/organization/orders/stream` | `init`, `created`, `updated`, `deleted` | All orders realtime |
| `GET /v1/organization/orders/:id/stream` | `init`, `created`, `updated`, `deleted` | Single order realtime |
| `GET /v1/organization/table/status/stream` | `init`, `status` | Table status realtime |

### How SSE Works

1. Client connects via `EventSource`
2. Server sends `init` event with full initial state
3. On mutations, server emits `created`/`updated`/`deleted` events
4. Client updates local state accordingly

### Example: Orders Stream Hook

```ts
// apps/web/modules/orders/hooks/use-orders-stream.ts
"use client"

import { useEffect, useState, useCallback } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"

type OrderEvent =
  | { type: "created"; data: OrderResponse }
  | { type: "updated"; data: OrderResponse }
  | { type: "deleted"; data: { id: string } }

export function useOrdersStream() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource("/api/organization/orders/stream")

    es.addEventListener("init", (e) => {
      setOrders(JSON.parse(e.data))
      setConnected(true)
    })

    es.addEventListener("created", (e) => {
      const newOrder: OrderResponse = JSON.parse(e.data)
      setOrders((prev) => [newOrder, ...prev])
    })

    es.addEventListener("updated", (e) => {
      const updated: OrderResponse = JSON.parse(e.data)
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      )
    })

    es.addEventListener("deleted", (e) => {
      const { id } = JSON.parse(e.data) as { id: string }
      setOrders((prev) => prev.filter((o) => o.id !== id))
    })

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  return { orders, connected }
}
```

### Example: Table Status Stream Hook

```ts
// apps/web/modules/table/hooks/use-table-status-stream.ts
"use client"

import { useEffect, useState, useCallback } from "react"
import type { TableStatusResponse } from "@workspace/shared/schemas/table/index"

export function useTableStatusStream() {
  const [tables, setTables] = useState<TableStatusResponse[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource("/api/organization/table/status/stream")

    es.addEventListener("init", (e) => {
      setTables(JSON.parse(e.data))
      setConnected(true)
    })

    es.addEventListener("status", (e) => {
      const updated: TableStatusResponse = JSON.parse(e.data)
      setTables((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )
    })

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  const updateStatus = useCallback(
    async (tableId: string, status: "available" | "occupied") => {
      await fetch("/api/organization/table/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tableId, status }),
      })
    },
    []
  )

  return { tables, connected, updateStatus }
}
```

### SSE Event Flow

```
Client connects to GET /organization/orders/stream
  │
  ▼
Server sends: event: "init", data: [...allOrders]
  │
  ▼
Client creates/updates/deletes via POST/PUT/DELETE
  │
  ▼
Logic emits EventEmitter event
  │
  ▼
SSE stream sends: event: "created"|"updated"|"deleted", data: {...}
  │
  ▼
Client updates local state instantly (no polling)
```

---

## Using Shared Schemas

All types are imported from `@workspace/shared`. **Never manually define interfaces** — always infer from schemas.

### Importing Types

```ts
// Schemas (for validation)
import { CreateMenuSchema, UpdateMenuSchema } from "@workspace/shared/schemas/menu/index"

// DTOs (for request bodies)
import type { CreateMenuDto, UpdateMenuDto } from "@workspace/shared/schemas/menu/index"

// Responses (for typed API responses)
import type { MenuResponse, MenuListResponse } from "@workspace/shared/schemas/menu/index"

// Enums
import { TableStatus, OrderStatus } from "@workspace/shared/enums/index"

// Constants
import { HTTP_STATUS_CODES } from "@workspace/shared/constants/index"
```

### Forms with React Hook Form

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateMenuSchema, type CreateMenuDto } from "@workspace/shared/schemas/menu/index"

function CreateMenuForm() {
  const { register, handleSubmit } = useForm<CreateMenuDto>({
    resolver: zodResolver(CreateMenuSchema),
    defaultValues: { name: "" },
  })

  const onSubmit = async (data: CreateMenuDto) => {
    const res = await fetch("/api/organization/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    // data is fully typed and validated
  }
}
```

### Available Schema Modules

| Module | Imports |
|--------|---------|
| `@workspace/shared/schemas/organization/index` | `CreateOrganizationSchema`, `UpdateOrganizationSchema`, `OrganizationResponse`, etc. |
| `@workspace/shared/schemas/menu/index` | `CreateMenuSchema`, `UpdateMenuSchema`, `MenuResponse`, etc. |
| `@workspace/shared/schemas/menu/menu-item/index` | `CreateMenuItemSchema`, `UpdateMenuItemSchema`, `MenuItemResponse`, etc. |
| `@workspace/shared/schemas/order/index` | `CreateOrderSchema`, `UpdateOrderSchema`, `OrderResponse`, etc. |
| `@workspace/shared/schemas/table/index` | `CreateTableSchema`, `UpdateTableSchema`, `TableResponse`, `TableStatusResponse`, etc. |
| `@workspace/shared/enums/index` | `OrderStatus`, `PaymentStatus`, `TableStatus`, `Role` |
| `@workspace/shared/constants/index` | `HTTP_STATUS_CODES`, `PAGINATION`, `LIMITS`, `REGEX` |

---

## Error Handling

Always handle these status codes:

```ts
async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...options,
  })

  const json = await res.json()

  if (json.status === "error") {
    switch (json.code) {
      case 400:
        // Validation error — json.errors contains field-level messages
        throw new Error(`Validation failed: ${JSON.stringify(json.errors)}`)
      case 401:
        // Unauthorized — redirect to login
        window.location.href = "/login"
        throw new Error("Unauthorized")
      case 404:
        throw new Error(json.message ?? "Not found")
      default:
        throw new Error(json.message ?? "Unknown error")
    }
  }

  return json.data as T
}
```

### Validation Error Shape

```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "price": ["Expected number, received string"]
  }
}
```

---

## File Uploads

Some endpoints accept `multipart/form-data` for file uploads (organization logo, menu item image).

```ts
async function uploadWithFile(path: string, data: Record<string, unknown>, file: File) {
  const formData = new FormData()

  // Add JSON fields
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, String(value))
  }

  // Add file
  formData.append("logo", file) // or "image" for menu items

  const res = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    body: formData, // Don't set Content-Type — browser sets it with boundary
  })

  return res.json()
}

// Usage
const logoFile = input.files[0]
await uploadWithFile("/organization", { name: "My Restaurant", slug: "my-restaurant" }, logoFile)
```

---

## Quick Reference

| What | Import from |
|------|-------------|
| Create schema + type | `@workspace/shared/schemas/{feature}/index` |
| Response type | `@workspace/shared/schemas/{feature}/index` |
| Enum | `@workspace/shared/enums/index` |
| Constant | `@workspace/shared/constants/index` |
| All exports | `@workspace/shared` |

| Endpoint | Method | Path |
|----------|--------|------|
| Current user | `GET` | `/v1/user/me` |
| User org | `GET` | `/v1/user/organization` |
| Get org | `GET` | `/v1/organization` |
| Create org | `POST` | `/v1/organization` |
| Update org | `PUT` | `/v1/organization` |
| List menus | `GET` | `/v1/organization/menu` |
| Create menu | `POST` | `/v1/organization/menu` |
| Update menu | `PUT` | `/v1/organization/menu` |
| Delete menu | `DELETE` | `/v1/organization/menu/:id` |
| List menu items | `GET` | `/v1/organization/menu/item/:menuId` |
| Create menu item | `POST` | `/v1/organization/menu/item` |
| Update menu item | `PUT` | `/v1/organization/menu/item` |
| Delete menu item | `DELETE` | `/v1/organization/menu/item/:id` |
| List orders | `GET` | `/v1/organization/orders` |
| Get order | `GET` | `/v1/organization/orders/:id` |
| Create order | `POST` | `/v1/organization/orders` |
| Update order | `PUT` | `/v1/organization/orders` |
| Delete order | `DELETE` | `/v1/organization/orders/:id` |
| Orders SSE | `GET` | `/v1/organization/orders/stream` |
| Single order SSE | `GET` | `/v1/organization/orders/:id/stream` |
| List tables | `GET` | `/v1/organization/table` |
| Create table | `POST` | `/v1/organization/table` |
| Update table | `PUT` | `/v1/organization/table` |
| Delete table | `DELETE` | `/v1/organization/table/:id` |
| Update table status | `PATCH` | `/v1/organization/table/status` |
| Table status SSE | `GET` | `/v1/organization/table/status/stream` |
| Generate QR token | `POST` | `/v1/organization/table/token` |
| Health check | `GET` | `/v1/status` |
