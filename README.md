# Roster Pro

B2B SaaS for restaurants. End-to-end type-safe monorepo.

## Apps

| App | Directory | Stack | Purpose |
|-----|-----------|-------|---------|
| **api** | `apps/api` | Hono, Drizzle ORM, Postgres, Bun | Backend API. Better-Auth, Upstash Redis, SSE realtime. |
| **web** | `apps/web` | Next.js 16, React 19, TanStack Query | Restaurant owner dashboard. Analytics, menus, orders, tables. |
| **client-web** | `apps/client-web` | Next.js 16, React 19 | Customer-facing menu & ordering per restaurant. |
| **marketing** | `apps/marketing` | Next.js 16, React 19 | Public landing page. |

## Packages

| Package | Purpose |
|---------|---------|
| `@workspace/shared` | Zod schemas, types, enums, constants — single source of truth for API contracts. |
| `@workspace/ui` | Shared shadcn/ui components, hooks, globals.css. Import via `@workspace/ui/components/*`. |
| `@workspace/eslint-config` | ESLint flat config presets. |
| `@workspace/typescript-config` | TS config presets. |

## Tech Stack

- **Runtime**: Bun 1.x (package manager + scripts)
- **Monorepo**: Turborepo v2
- **Backend**: Hono, Drizzle ORM, Postgres, Upstash Redis
- **Auth**: Better Auth (Google OAuth), Polar.sh payments
- **Frontend**: Next.js 16, React 19, Tailwind v4, shadcn/ui
- **Data Fetching**: TanStack React Query v5, Axios
- **Linting**: Biome v2, ESLint 9

## Structure Conventions

- **Pages are server components.** Client interactivity via `"use client"` subcomponents in `modules/{feature}/ui/`.
- **Feature-organized modules**:
  ```
  modules/
    views/ui/          # Client components
    server/            # Server logic
    utils/             # Utilities
    types/             # Types
  ```
- **API 3-file pattern** per feature: `{feature}.route.ts` → `{feature}.logic.ts` → `{feature}.validation.ts`.
- **`@workspace/shared`** is the single source of truth — never duplicate schemas or types.
- **SSE** for realtime updates (orders, table status).

## Getting Started

```sh
bun install
bun run dev
```

Requires Postgres, Upstash Redis, and env vars (see `.env.example` in each app).
