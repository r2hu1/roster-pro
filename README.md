# Roster Pro

B2B SaaS for restaurants. End-to-end type-safe monorepo.

## Apps

| App | Directory | Stack | Purpose |
|-----|-----------|-------|---------|
| **api** | `apps/api` | Hono, Drizzle ORM, Postgres, Bun | Backend API |
| **web** | `apps/web` | Next.js 16, React 19, TanStack Query | Restaurant owner dashboard |
| **client-web** | `apps/client-web` | Next.js 16, React 19 | Customer-facing menu & ordering |
| **marketing** | `apps/marketing` | Next.js 16, React 19 | Public landing page |

## Packages

| Package | Purpose |
|---------|---------|
| `@workspace/shared` | Zod schemas, types, enums, constants |
| `@workspace/ui` | Shared shadcn/ui components |
| `@workspace/eslint-config` | ESLint flat config presets |
| `@workspace/typescript-config` | TS config presets |

## Prerequisites

- **Bun** 1.x (package manager + runtime)
- **Postgres** (local or remote)
- **Upstash Redis** (cache + realtime pub/sub)
- **Google OAuth** credentials
- **Polar.sh** account (payments)
- **ImageKit** account (image uploads)

## Getting Started

```sh
git clone <repo>
cd roster-pro

# Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/client-web/.env.example apps/client-web/.env

# Install
bun install

# Push DB schema
bun run db:push

# Start all apps
bun run dev
```

Individual apps: `bun run dev:api`, `bun run dev:web`, `bun run dev:client-web`, `bun run dev:marketing`.

## Scripts

| Command | Action |
|---------|--------|
| `bun run dev` | Start all apps in dev mode |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all packages |
| `bun run format` | Format all packages |
| `bun run typecheck` | TypeScript check all packages |
| `bun run fix` | Auto-fix lint issues |
| `bun run db:push` | Push Drizzle schema to DB |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:generate` | Generate migration files |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run clean` | Clean build artifacts |

## Project Structure

Refer to [STRUCTURE.md](./STRUCTURE.md) for full architecture guide.

## Tech Stack

- **Runtime**: Bun 1.x
- **Monorepo**: Turborepo v2
- **Backend**: Hono, Drizzle ORM, Postgres, Upstash Redis
- **Auth**: Better Auth (Google OAuth + org plugin + Polar plugin), Redis secondary storage
- **Payments**: Polar.sh (checkout, portal, webhooks)
- **Media**: ImageKit (upload/delete)
- **Frontend**: Next.js 16, React 19, Tailwind v4, shadcn/ui
- **Data Fetching**: TanStack React Query v5, Axios
- **Linting**: Biome v2, ESLint 9
- **Realtime**: Upstash Realtime (Redis pub/sub)

## Key Conventions

- **Schema-first**: `@workspace/shared` is single source of truth — never duplicate types
- **API 3-file pattern**: `{feature}.route.ts` → `{feature}.logic.ts` → `{feature}.validation.ts`
- **Feature-organized modules**: `modules/{feature}/views/ui/`, `hooks/`, `api/`
- **Pages are server components** — client interactivity via `"use client"` subcomponents
- **Realtime**: Upstash Realtime for orders, table status, analytics
