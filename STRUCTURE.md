# Roster Pro — Architecture Guide

End-to-end type-safe monorepo with `@workspace/shared` as single source of truth for API contracts.

## Project Layout

```
roster-pro/
  apps/
    api/            Hono server (port 3000)
    web/            Next.js dashboard (port 3001)
    client-web/     Next.js customer-facing (port 3003)
    marketing/      Next.js landing page (port 3002)
  packages/
    shared/         Zod schemas, types, enums, constants
    ui/             Shared UI components (shadcn/ui)
    eslint-config/  ESLint flat config presets
    typescript-config/ TS config presets
  drizzle/          Generated migrations
```

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Bun 1.x |
| Monorepo | Turborepo v2 |
| Backend | Hono + Drizzle ORM + Postgres |
| Auth | Better Auth (Google OAuth) |
| Payments | Polar.sh |
| Cache/Realtime | Upstash Redis + Upstash Realtime |
| Dashboard | Next.js 16 + React 19 + TanStack Query + Axios |
| Customer UI | Next.js 16 + React 19 |
| Styling | Tailwind v4 + shadcn/ui |
| Linting | Biome v2 + ESLint 9 |

## Architecture Overview

```
                    ┌─────────────┐
                    │   Postgres   │
                    └──────┬──────┘
                           │ Drizzle ORM
                    ┌──────┴──────┐
                    │  API (Hono) │
                    │  port 3000  │
                    └───┬───┬────┘
                        │   │
          ┌─────────────┘   └─────────────┐
          │  HTTP (rewrites)              │ Upstash Realtime
    ┌─────┴──────┐                 ┌──────┴──────┐
    │  Web (Nx)  │                 │ Client-Web  │
    │  port 3001 │                 │  port 3003  │
    └────────────┘                 └─────────────┘
```

## Apps

### API (`apps/api`)

Hono server, Drizzle ORM + Postgres, Better Auth, Upstash Redis/Realtime.

**Route structure** — 3-file pattern per feature:

```
routes/organization/
  organization.route.ts       HTTP handlers
  organization.logic.ts       Business logic
  organization.validation.ts  Re-exports from @workspace/shared
  menu/
    menu.route.ts
    menu.logic.ts
    menu.validation.ts
    menu-item/
      menu-item.route.ts
      menu-item.logic.ts
      menu-item.validation.ts
  orders/
    orders.route.ts
    orders.logic.ts
    orders.validation.ts
  table/
    table.route.ts
    table.logic.ts
    table.validation.ts
  analytics/
    analytics.route.ts
    analytics.logic.ts
    analytics.validation.ts
routes/user/
  user.route.ts
  user.logic.ts
```

**Middleware stack** (applied in order):

1. `requestLogger` — request ID generation, colored dev logging
2. `corsMiddleware` — origin allowlist, credentials
3. Better Auth handler — `POST/GET /auth/*`
4. `onError` / `notFound` — global error boundary

**Session middleware** applied per-route group — sets `user`, `session`, `organizationId` on context. Excludes Polar webhooks path.

**Core modules:**

| Module | Path | Purpose |
|--------|------|---------|
| DB client | `core/db/client.ts` | Drizzle + pg Pool singleton |
| DB schemas | `core/db/schemas/` | Drizzle table definitions |
| Redis | `core/redis/client.ts` | Upstash Redis wrapper with SCAN-based pattern delete |
| ImageKit | `core/imagekit/` | Image upload/delete |
| Polar | `core/polar/client.ts` | Payment SDK client |
| Auth | `lib/better-auth/auth.ts` | Better Auth config + Polar plugin |
| Crypto | `lib/crypto.ts` | AES-256-GCM encrypt/decrypt (QR tokens) |
| Realtime | `lib/realtime.ts` | Upstash Realtime pub/sub singleton |

### Web (`apps/web`)

Restaurant owner dashboard. Next.js 16 with App Router.

**Page structure:**

```
app/
  (dashboard)/          Authenticated pages (layout with sidebar)
  (onboarding)/         Auth, subscription setup
  api/                  Next.js API routes (auth helpers)
  layout.tsx            Root layout
  page.tsx              Landing / redirect
```

**Feature modules** (under `modules/`):

| Module | Purpose |
|--------|---------|
| `analytics/` | Charts, revenue, top items |
| `menus/` | Menu & menu-item CRUD |
| `orders/` | Order list, status controls, realtime |
| `tables/` | Table CRUD, QR codes, status |
| `receipts/` | Print receipts, data table |
| `sidebar/` | Navigation, kitchen mode toggle |
| `settings/` | Organization settings |
| `onboarding/` | Auth flow, subscription |
| `providers/` | React Query, session, kitchen mode |

**Module pattern:** `views/ui/` (client components), `api/` (API calls), `hooks/` (realtime streams, mutations).

**Rewrites:** `/api/:path*` → `http://localhost:3000/v1/:path*` (dev) or API_URL.

### Client-Web (`apps/client-web`)

Customer-facing menu ordering per restaurant. Next.js 16.

**Rewrites:** Same pattern as web.

### Marketing (`apps/marketing`)

Public landing page. No API dependency.

## Packages

### `@workspace/shared`

Single source of truth for all contracts. Zero runtime dependencies (Zod only).

```
src/
  enums/            OrderStatus, PaymentStatus, TableStatus, Role
  constants/        HTTP_STATUS_CODES, PAGINATION, LIMITS, REGEX
  schemas/          Zod schemas organized by feature
  types/            Backward-compatible re-exports
  utils/            Formatters
  index.ts          Top-level barrel
```

**Schema convention — every feature folder exports four things:**

| Export | Purpose | Example |
|--------|---------|---------|
| `XxxSchema` | Zod validation schema | `CreateMenuSchema` |
| `XxxDto` | Inferred type | `type CreateMenuDto = z.infer<typeof CreateMenuSchema>` |
| `XxxResponseSchema` | API response shape | `MenuResponseSchema` |
| `defaultXxx` | Form defaults | `defaultCreateMenu` |

**Naming:**

```
CreateXxxSchema       POST request body
UpdateXxxSchema       PUT/PATCH request body
DeleteXxxSchema       DELETE request body
XxxResponseSchema     Single object response
XxxListResponseSchema Array response
```

**Import paths:**

```ts
// Canonical (preferred)
import { CreateMenuSchema } from "@workspace/shared/schemas/menu/index"
import { OrderStatus } from "@workspace/shared/enums/index"
import { HTTP_STATUS_CODES } from "@workspace/shared/constants/index"

// Top-level barrel
import { CreateMenuSchema, OrderStatus, HTTP_STATUS_CODES } from "@workspace/shared"

// Backward-compat (being migrated)
import { CreateMenuDto } from "@workspace/shared/types/organization/menu/dto"
```

**Rules:**
1. Never write interfaces manually — always infer from Zod schemas
2. Never duplicate schemas — shared package is single source of truth
3. Validation must use shared schemas (via `zvalidator` middleware)
4. Route handlers use shared DTOs
5. Frontend forms use shared schemas with `zodResolver`
6. Every schema file exports Schema + Type + Default
7. Every folder has `index.ts` barrel
8. Organize by feature, not by layer
9. Never use `any` — use `z.infer<>`

### `@workspace/ui`

Shared UI components. shadcn/ui + Radix primitives.

**Import paths:**
```ts
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import "@workspace/ui/globals.css"
```

## Realtime Architecture

Uses **Upstash Realtime** (Redis-based pub/sub), NOT in-memory EventEmitter SSE.

### Flow

```
Client (React)          API (Hono)              Upstash Realtime
     │                      │                        │
     │  createOrder() ─────►│                        │
     │                      ├──► Insert DB           │
     │                      ├──► realtime.emit() ────┤
     │◄──── useRealtime() hook ─── (pub/sub) ────────┤
```

### Server (`apps/api/src/lib/realtime.ts`)

Singleton `Realtime` instance. Publishes events on channels:
- `orders:{orgId}` — `order.created`, `order.updated`, `order.deleted`
- `order:{orderId}` — per-order events
- `table:{orgId}` — `table.status`, `table.deleted`
- `analytics:{orgId}` — `analytics.updated`

Gracefully degrades if Redis env vars are missing (returns `null`, consumers use `?.`).

### Client (`apps/web/lib/realtime-client.ts`)

Creates `useRealtime` hook via `@upstash/realtime/client`. React hook subscribes to relevant channels.

### Frontend hooks (`apps/web/modules/*/hooks/`)

| Hook | File | Subscribes to |
|------|------|---------------|
| `useOrdersStream` | `orders/hooks/use-orders-stream.ts` | `orders:{orgId}` |
| `useOrderStream` | `orders/hooks/use-order-stream.ts` | `order:{orderId}` |
| `useTableStatusStream` | `tables/hooks/use-table-status-stream.ts` | `table:{orgId}` |

## Caching Strategy

Redis cache with key prefixes and TTL:

| Cache | Prefix | TTL | Invalidation |
|-------|--------|-----|-------------|
| Menu list | `menu:all:{orgId}` | 300s | On create/update/delete |
| Menu items | `menu_items:all:{menuId}` | 300s | On create/update/delete |
| Orders list | `order:all:{orgId}` | 300s | On any order mutation |
| Single order | `order:{orgId}:{orderId}` | 300s | On update/delete |
| Tables list | `table:all:{orgId}` | 300s | On create/update/delete |

Invalidation uses `delPattern` (SCAN-based) which can be slow at scale.

## Database

**Dialect:** PostgreSQL via Drizzle ORM
**Migration tool:** `drizzle-kit` (migrations in `/drizzle/`)
**Pool config:** `max: 10`, `idleTimeout: 30s`, `connectionTimeout: 10s`, `statement_timeout: 15s`

**Tables:**

| Schema file | Tables |
|-------------|--------|
| `auth.ts` | user, session, account, verification, organization, member, invitation |
| `menu.ts` | menu, menu_item |
| `table.ts` | table |
| `order.ts` | order, order_item, order_counter |

All tables have UUID primary keys (`$defaultFn(() => uuidv4())`), organization-scoped via `organizationId` FK with cascade delete, and composite indexes on `(organizationId, createdAt)` for paginated queries.

## Auth Flow

Better Auth with Google OAuth + Polar.sh payment integration.

1. User signs in via Google → Better Auth creates user session
2. `sessionMiddleware` validates session on protected routes
3. On first organization creation, Polar customer is created
4. Subscription managed via Polar checkout/portal/webhooks
5. Organization-scoped: all resources filter by `organizationId` from session

**Secondary storage:** Redis (session cache, rate limiting backing).

## Deployment

- **API:** Deployed as Node.js server (Hono), Vercel config present
- **Web:** Next.js app, Vercel-ready
- **Client-Web:** Next.js app, Vercel-ready
- **Marketing:** Next.js app, Vercel-ready

No CI/CD pipeline configured yet. Manual deploy only.

## Environment Variables

See `.env.example` in each app:
- `apps/api/.env.example` — DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_*, UPSTASH_REDIS_*, POLAR_*, IMAGEKIT_*, ENCRYPTION_KEY
- `apps/web/.env.example` — API_URL, NEXT_PUBLIC_* URLs, UPSTASH_REDIS_*
- `apps/client-web/.env.example` — API_URL, NEXT_PUBLIC_* URLs
