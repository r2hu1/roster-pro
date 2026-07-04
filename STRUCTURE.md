# Roster Pro - Architecture Guide

End-to-end type-safe monorepo with `@workspace/shared` as the single source of truth for every API contract.

## Table of Contents

- [Project Layout](#project-layout)
- [Shared Package Structure](#shared-package-structure)
- [Schema Conventions](#schema-conventions)
- [Creating a New Feature](#creating-a-new-feature)
- [Realtime SSE Pattern](#realtime-sse-pattern)
- [Using Schemas in the Frontend](#using-schemas-in-the-frontend)
- [Barrel Exports](#barrel-exports)
- [Rules](#rules)

---

## Project Layout

```
roster-pro/
  apps/
    api/          Hono server (port 3000)
    web/          Next.js dashboard (port 3001)
    client-web/   Next.js customer-facing (port 3003)
  packages/
    shared/       Schemas, types, enums, constants
    ui/           Shared UI components (shadcn)
```

---

## Shared Package Structure

```
packages/shared/src/
  enums/
    index.ts              OrderStatus, PaymentStatus, TableStatus, Role
  constants/
    index.ts              HTTP_STATUS_CODES, PAGINATION, LIMITS, REGEX
  schemas/
    organization/
      base.ts             OrganizationSchema, MemberSchema, InvitationSchema
      create.ts           CreateOrganizationSchema, CreateOrganizationDto
      update.ts           UpdateOrganizationSchema, UpdateMemberSchema
      response.ts         OrganizationResponseSchema
      index.ts            barrel
    menu/
      base.ts             MenuSchema
      create.ts           CreateMenuSchema
      update.ts           UpdateMenuSchema
      response.ts         MenuResponseSchema
      index.ts            barrel
      menu-item/
        base.ts           MenuItemSchema, PriceSchema
        create.ts         CreateMenuItemSchema
        update.ts         UpdateMenuItemSchema
        response.ts       MenuItemResponseSchema
        index.ts          barrel
    order/
      base.ts             OrderSchema, OrderItemSchema
      create.ts           CreateOrderSchema
      update.ts           UpdateOrderSchema
      response.ts         OrderResponseSchema
      index.ts            barrel
    table/
      base.ts             TableSchema
      create.ts           CreateTableSchema
      update.ts           UpdateTableSchema, UpdateTableStatusSchema
      response.ts         TableResponseSchema, TableStatusResponseSchema
      index.ts            barrel
    user/
      base.ts             UserSchema, SessionSchema, AccountSchema
      update.ts           UpdateUserSchema
      response.ts         UserResponseSchema
      index.ts            barrel
    review/
      base.ts             ReviewSchema
      create.ts           CreateReviewSchema
      update.ts           UpdateReviewSchema
      response.ts         ReviewResponseSchema
      index.ts            barrel
  types/                  backward-compatible re-exports from schemas
  index.ts                top-level barrel
```

---

## Schema Conventions

Every feature schema folder exports four things:

| Export | Purpose | Example |
|--------|---------|---------|
| `XxxSchema` | Zod validation schema (request body) | `CreateMenuSchema` |
| `XxxDto` | Inferred type from schema (use in code) | `type CreateMenuDto = z.infer<typeof CreateMenuSchema>` |
| `XxxResponseSchema` | What the API returns | `MenuResponseSchema` |
| `defaultXxx` | Default values for forms | `defaultCreateMenu` |

### Naming pattern

```
CreateXxxSchema    - POST request body
UpdateXxxSchema    - PUT/PATCH request body
DeleteXxxSchema    - DELETE request body (usually just { id: string })
XxxResponseSchema  - single object response
XxxListResponseSchema - array response
```

### Inferred types

```ts
// WRONG - never write interfaces manually
export interface CreateMenuDto { name: string }

// RIGHT - always infer from schema
export const CreateMenuSchema = z.object({ name: z.string().min(1) })
export type CreateMenuDto = z.infer<typeof CreateMenuSchema>
```

### Reusing schemas

```ts
// base.ts - shared fields
export const MenuSchema = z.object({
  id: z.string(),
  name: z.string(),
  ...
})

// create.ts - only writable fields
export const CreateMenuSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

// update.ts - id + optional fields
export const UpdateMenuSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})
```

---

## Creating a New Feature

### 1. Create shared schemas

```
packages/shared/src/schemas/{feature}/
  base.ts
  create.ts
  update.ts
  response.ts
  index.ts
```

**base.ts**
```ts
import { z } from "zod"

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Feature = z.infer<typeof FeatureSchema>
```

**create.ts**
```ts
import { z } from "zod"

export const CreateFeatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export type CreateFeatureDto = z.infer<typeof CreateFeatureSchema>

export const defaultCreateFeature: z.input<typeof CreateFeatureSchema> = {
  name: "",
}
```

**update.ts**
```ts
import { z } from "zod"

export const UpdateFeatureSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
})

export type UpdateFeatureDto = z.infer<typeof UpdateFeatureSchema>
```

**response.ts**
```ts
import { z } from "zod"
import { FeatureSchema } from "./base"

export const FeatureResponseSchema = FeatureSchema
export type FeatureResponse = z.infer<typeof FeatureResponseSchema>

export const FeatureListResponseSchema = z.array(FeatureSchema)
export type FeatureListResponse = z.infer<typeof FeatureListResponseSchema>
```

**index.ts**
```ts
export { FeatureSchema, type Feature } from "./base"
export { CreateFeatureSchema, type CreateFeatureDto, defaultCreateFeature } from "./create"
export { UpdateFeatureSchema, type UpdateFeatureDto } from "./update"
export { FeatureResponseSchema, type FeatureResponse, FeatureListResponseSchema, type FeatureListResponse } from "./response"
```

### 2. Add enums (if needed)

```ts
// packages/shared/src/enums/index.ts
export const FeatureStatus = z.enum(["active", "inactive"])
export type FeatureStatus = z.infer<typeof FeatureStatus>
```

### 3. Add constants (if needed)

```ts
// packages/shared/src/constants/index.ts
export const FEATURE_LIMITS = { MAX_NAME: 100 } as const
```

### 4. Create API validation file

```ts
// apps/api/src/routes/{feature}/{feature}.validation.ts
export {
  CreateFeatureSchema as createFeatureSchema,
  UpdateFeatureSchema as updateFeatureSchema,
  type CreateFeatureDto,
  type UpdateFeatureDto,
} from "@workspace/shared/schemas/{feature}/index"
```

### 5. Create API logic file

```ts
// apps/api/src/routes/{feature}/{feature}.logic.ts
import { and, eq } from "drizzle-orm"
import { db } from "../../core/db/client.js"
import { feature } from "../../core/db/schemas/{feature}.js"
import { HTTP_STATUS_CODES } from "../../lib/utils.js"
import type { CreateFeatureDto, UpdateFeatureDto } from "@workspace/shared/schemas/{feature}/index"

export const featureLogic = {
  getAll: async (organizationId: string) => {
    const items = await db.select().from(feature).where(eq(feature.organizationId, organizationId))
    return { status: "success", code: HTTP_STATUS_CODES.OK, data: items }
  },

  getById: async (id: string, organizationId: string) => {
    const [found] = await db.select().from(feature).where(and(eq(feature.id, id), eq(feature.organizationId, organizationId)))
    if (!found) return { status: "error", code: HTTP_STATUS_CODES.NOT_FOUND, message: "Not found" }
    return { status: "success", code: HTTP_STATUS_CODES.OK, data: found }
  },

  create: async (body: CreateFeatureDto, organizationId: string) => {
    const [created] = await db.insert(feature).values({ ...body, organizationId }).returning()
    return { status: "success", code: HTTP_STATUS_CODES.CREATED, data: created }
  },

  update: async (body: UpdateFeatureDto, organizationId: string) => {
    const [updated] = await db.update(feature).set({ ...body }).where(and(eq(feature.id, body.id), eq(feature.organizationId, organizationId))).returning()
    return { status: "success", code: HTTP_STATUS_CODES.OK, data: updated }
  },

  delete: async (id: string, organizationId: string) => {
    await db.delete(feature).where(and(eq(feature.id, id), eq(feature.organizationId, organizationId)))
    return { status: "success", code: HTTP_STATUS_CODES.NO_CONTENT }
  },
}
```

### 6. Create API route file

```ts
// apps/api/src/routes/{feature}/{feature}.route.ts
import { Hono } from "hono"
import type { AppEnv } from "../../index.js"
import { HTTP_STATUS_CODES, zvalidator } from "../../lib/utils.js"
import { sessionMiddleware } from "../../middleware/session.js"
import { featureLogic } from "./{feature}.logic.js"
import { createFeatureSchema, updateFeatureSchema } from "./{feature}.validation.js"

export const featureRouter = new Hono<AppEnv>()

featureRouter.use(sessionMiddleware)

featureRouter.get("/", async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) return c.json({ status: "error", code: HTTP_STATUS_CODES.UNAUTHORIZED, message: "Unauthorized" }, HTTP_STATUS_CODES.UNAUTHORIZED)
  const result = await featureLogic.getAll(organizationId)
  return c.json(result)
})

featureRouter.get("/:id", async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) return c.json({ status: "error", code: HTTP_STATUS_CODES.UNAUTHORIZED, message: "Unauthorized" }, HTTP_STATUS_CODES.UNAUTHORIZED)
  const id = c.req.param("id")
  const result = await featureLogic.getById(id, organizationId)
  return c.json(result)
})

featureRouter.post("/", zvalidator(createFeatureSchema), async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) return c.json({ status: "error", code: HTTP_STATUS_CODES.UNAUTHORIZED, message: "Unauthorized" }, HTTP_STATUS_CODES.UNAUTHORIZED)
  const body = c.req.valid("json")
  const result = await featureLogic.create(body, organizationId)
  return c.json(result)
})

featureRouter.put("/", zvalidator(updateFeatureSchema), async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) return c.json({ status: "error", code: HTTP_STATUS_CODES.UNAUTHORIZED, message: "Unauthorized" }, HTTP_STATUS_CODES.UNAUTHORIZED)
  const body = c.req.valid("json")
  const result = await featureLogic.update(body, organizationId)
  return c.json(result)
})

featureRouter.delete("/:id", async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) return c.json({ status: "error", code: HTTP_STATUS_CODES.UNAUTHORIZED, message: "Unauthorized" }, HTTP_STATUS_CODES.UNAUTHORIZED)
  const id = c.req.param("id")
  const result = await featureLogic.delete(id, organizationId)
  return c.json(result)
})
```

### 7. Register the route

```ts
// apps/api/src/app.ts
import { featureRouter } from "./routes/{feature}/{feature}.route.js"

export function registerRoutes(app: AppHono) {
  // ... existing routes
  app.route("/feature", featureRouter)
}
```

### 8. Add DB schema (if new table)

```ts
// apps/api/src/core/db/schemas/{feature}.ts
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core"
import { organization } from "./auth.js"
import { v4 as uuidv4 } from "uuid"

export const feature = pgTable("feature", {
  id: text("id").primaryKey().default(uuidv4()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  idIdx: index("feature_id_idx").on(table.id),
  orgIdx: index("feature_org_idx").on(table.organizationId),
}))
```

---

## Realtime SSE Pattern

For features that need real-time updates (orders, table status, etc.), use Server-Sent Events (SSE) via an `EventEmitter`.

### Architecture

```
Client  <--SSE-->  Route  <-->  Logic  <-->  DB
                       ^
                       |
                  EventEmitter
```

1. **Logic layer** emits events after each mutation (create/update/delete)
2. **Route layer** streams events to connected clients via `streamSSE`
3. **Client** receives events in real-time via `EventSource`

### 1. Add EventEmitter to logic file

```ts
// apps/api/src/routes/{feature}/{feature}.logic.ts
import { EventEmitter } from "node:events"

export const featureEmitter = new EventEmitter()
featureEmitter.setMaxListeners(100)

type FeatureCreatedEvent = { type: "created"; data: typeof feature.$inferSelect }
type FeatureUpdatedEvent = { type: "updated"; data: typeof feature.$inferSelect }
type FeatureDeletedEvent = { type: "deleted"; data: { id: string } }

export type FeatureEvent = FeatureCreatedEvent | FeatureUpdatedEvent | FeatureDeletedEvent
```

### 2. Emit events after mutations

```ts
create: async (body, organizationId) => {
  const [created] = await db.insert(feature).values({ ...body, organizationId }).returning()

  // Emit realtime event
  featureEmitter.emit(`features:${organizationId}`, {
    type: "created",
    data: created,
  } satisfies FeatureCreatedEvent)

  return { status: "success", code: HTTP_STATUS_CODES.CREATED, data: created }
},

delete: async (id, organizationId) => {
  await db.delete(feature).where(eq(feature.id, id))

  // Emit realtime event
  featureEmitter.emit(`features:${organizationId}`, {
    type: "deleted",
    data: { id },
  } satisfies FeatureDeletedEvent)

  return { status: "success", code: HTTP_STATUS_CODES.NO_CONTENT }
},
```

### 3. Add SSE stream endpoint to route

```ts
// apps/api/src/routes/{feature}/{feature}.route.ts
import { streamSSE } from "hono/streaming"
import type { FeatureResponse } from "@workspace/shared/schemas/{feature}/index"
import { featureLogic, featureEmitter } from "./{feature}.logic.js"

featureRouter.get("/stream", async (c) => {
  const organizationId = c.get("organizationId")
  if (!organizationId) return c.json({ ... }, HTTP_STATUS_CODES.UNAUTHORIZED)

  // Send initial state
  const initialData = await featureLogic.getAll(organizationId)
  if (initialData.status === "error") {
    return c.json(initialData, initialData.code as 404)
  }

  return streamSSE(c, async (stream) => {
    // Send full list on connect
    await stream.writeSSE({
      event: "init",
      data: JSON.stringify(initialData.data),
    })

    // Listen for realtime events
    const listener = (event: FeatureEvent) => {
      stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event.data),
      })
    }

    featureEmitter.on(`features:${organizationId}`, listener)

    // Cleanup on disconnect
    stream.onAbort(() => {
      featureEmitter.off(`features:${organizationId}`, listener)
    })

    await new Promise<void>((resolve) => {
      stream.onAbort(() => resolve())
    })
  })
})
```

### 4. Consume SSE on the client

```ts
// apps/web/modules/{feature}/hooks/use-{feature}-stream.ts
"use client"

import { useEffect, useState, useCallback } from "react"
import type { FeatureResponse } from "@workspace/shared/schemas/{feature}/index"

type FeatureEvent =
  | { type: "created"; data: FeatureResponse }
  | { type: "updated"; data: FeatureResponse }
  | { type: "deleted"; data: { id: string } }

export function useFeatureStream() {
  const [features, setFeatures] = useState<FeatureResponse[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource("/api/{feature}/stream")

    es.addEventListener("init", (e) => {
      setFeatures(JSON.parse(e.data))
      setConnected(true)
    })

    es.addEventListener("created", (e) => {
      const newFeature: FeatureResponse = JSON.parse(e.data)
      setFeatures((prev) => [...prev, newFeature])
    })

    es.addEventListener("updated", (e) => {
      const updated: FeatureResponse = JSON.parse(e.data)
      setFeatures((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f))
      )
    })

    es.addEventListener("deleted", (e) => {
      const { id } = JSON.parse(e.data) as { id: string }
      setFeatures((prev) => prev.filter((f) => f.id !== id))
    })

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  return { features, connected }
}
```

### SSE Event Flow

```
Client connects to GET /{feature}/stream
  |
  v
Server sends: event: "init", data: [...all items]
  |
  v
Client creates/updates/deletes via POST/PUT/DELETE
  |
  v
Logic emits EventEmitter event
  |
  v
SSE stream sends: event: "created"|"updated"|"deleted", data: {...}
  |
  v
Client updates local state instantly (no polling)
```

### Existing SSE Implementations

| Feature | Stream Endpoint | Events |
|---------|----------------|--------|
| Orders | `GET /organization/orders/stream` | `init`, `created`, `updated`, `deleted` |
| Table Status | `GET /organization/table/status/stream` | `init`, `status` |

---

## Using Schemas in the Frontend

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

  const onSubmit = (data: CreateMenuDto) => {
    // data is fully typed
    console.log(data.name) // string
  }
}
```

### Displaying API responses

```tsx
import type { MenuResponse, MenuListResponse } from "@workspace/shared/schemas/menu/index"

function MenuList({ menus }: { menus: MenuListResponse }) {
  return menus.map(menu => <div key={menu.id}>{menu.name}</div>)
}
```

### Using enums

```tsx
import { TableStatus } from "@workspace/shared/enums/index"

// Use in validation, comparisons, etc.
const isAvailable = table.status === TableStatus.enum.available
```

### Using constants

```ts
import { HTTP_STATUS_CODES, PAGINATION } from "@workspace/shared/constants/index"

const limit = PAGINATION.DEFAULT_LIMIT // 20
```

---

## Barrel Exports

### Top-level import

```ts
import {
  CreateMenuSchema,
  CreateMenuDto,
  MenuResponse,
  OrderStatus,
  HTTP_STATUS_CODES,
} from "@workspace/shared"
```

### Deep imports (backward compatible)

```ts
import { CreateMenuDto } from "@workspace/shared/types/organization/menu/dto"
import { Menu } from "@workspace/shared/types/organization/menu/types"
import { OrderStatus } from "@workspace/shared/enums/index"
import { HTTP_STATUS_CODES } from "@workspace/shared/constants/index"
import { CreateMenuSchema } from "@workspace/shared/schemas/menu/index"
```

---

## Rules

1. **NEVER write interfaces manually.** Always infer from Zod schemas.

2. **NEVER duplicate schemas.** The shared package is the single source of truth.

3. **Validation MUST use shared schemas.**
   ```ts
   // WRONG
   const body = await c.req.json()
   if (!body.name) { ... }

   // RIGHT
   const body = CreateMenuSchema.parse(await c.req.json())
   // or via zvalidator middleware
   ```

4. **Route handlers use shared DTOs.**
   ```ts
   // WRONG
   const body: { name: string; price: number } = c.req.valid("json")

   // RIGHT
   const body: CreateMenuDto = c.req.valid("json")
   ```

5. **Frontend forms use shared schemas.**
   ```ts
   // WRONG
   useForm({ schema: customSchema })

   // RIGHT
   useForm({ resolver: zodResolver(CreateMenuSchema) })
   ```

6. **Every schema file exports Schema + Type + Default.**
   ```ts
   export const CreateMenuSchema = z.object({ ... })
   export type CreateMenuDto = z.infer<typeof CreateMenuSchema>
   export const defaultCreateMenu: z.input<typeof CreateMenuSchema> = { ... }
   ```

7. **Every folder exports from index.ts.**
   ```ts
   // consumers write:
   import { CreateMenuSchema, CreateMenuDto, MenuResponse } from "@workspace/shared"
   ```

8. **Reuse schemas.**
   ```ts
   // base.ts defines shared fields
   // create.ts only includes writable fields
   // update.ts = id + partial(create)
   ```

9. **Never use `any`.** Use `z.infer<>` for all types.

10. **Organize by feature**, not by layer.
    ```
    schemas/menu/create.ts    ✓
    schemas/create/menu.ts    ✗
    ```

---

## Quick Reference

| What you need | Import from |
|---------------|-------------|
| Create schema + type | `@workspace/shared/schemas/{feature}/index` |
| Response schema | `@workspace/shared/schemas/{feature}/index` |
| Enum | `@workspace/shared/enums/index` |
| Constant | `@workspace/shared/constants/index` |
| All exports | `@workspace/shared` |
| Backward compat DTOs | `@workspace/shared/types/...` |
