# Roster Pro

Modern, end-to-end type-safe B2B SaaS restaurant management and contactless dine-in ordering platform.

Built with Next.js 16, React 19, Hono, Drizzle ORM, PostgreSQL, and Upstash Redis.

---

## Highlights & Features

- **Digital QR Dine-In & Contactless Ordering**: Guests scan table QR codes from their phone cameras to view interactive digital menus, select variations, customize items, and place orders directly to the kitchen without waiting for staff.
- **Kitchen & Order Management**: Realtime order dispatch board with automatic status transitions (`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `SERVED` → `COMPLETED`).
- **Interactive Menu Builder**: Create dynamic menu categories, dishes, multi-pricing options (Half / Full / Portions), tags, dietary filters, and dish photos.
- **Table & Floor Plan Operations**: Manage dining tables, capacities, occupancies, and generate secure QR codes.
- **Analytics & Revenue Insights**: Track daily sales, top-selling dishes, peak dining hours, and average ticket sizes in real-time.
- **Multi-Tenant Organizations & Role-Based Access**: Role-based access control (Owner, Admin, Staff) with team invitations and Google OAuth.
- **Realtime Kitchen Updates**: Powered by Upstash Redis Pub/Sub for zero-refresh kitchen tickets and customer status tracking.
- **End-to-End Type Safety**: Shared validation schemas and TypeScript types across backend and frontends via `@workspace/shared`.

---

## Monorepo Apps & Packages

| Component | Path | Tech Stack | Role |
|-----------|------|------------|------|
| **api** | `apps/api` | Hono, Drizzle ORM, PostgreSQL, Bun | High-speed REST backend API & realtime engine |
| **web** | `apps/web` | Next.js 16, React 19, TanStack Query | Management dashboard for restaurant owners and staff |
| **client-web** | `apps/client-web` | Next.js 16, React 19, Tailwind v4 | Mobile-optimized guest ordering interface |
| **marketing** | `apps/marketing` | Next.js 16, React 19, Tailwind v4 | Public-facing landing page and marketing site |
| **@workspace/shared** | `packages/shared` | Zod, TypeScript | Shared schemas, enums, DTO contracts, and types |
| **@workspace/ui** | `packages/ui` | shadcn/ui, Tailwind CSS | Reusable UI component library |

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Bun** 1.x
- **PostgreSQL** (local or cloud instance)
- **Upstash Redis** (or local Redis instance)
- **Google OAuth** Client ID & Secret

### 2. Installation
```sh
# Clone repository
git clone https://github.com/your-org/roster-pro.git
cd roster-pro

# Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/client-web/.env.example apps/client-web/.env

# Install dependencies
bun install
```

### 3. Database Setup
```sh
# Push schema to database
bun run db:push
```

### 4. Run Development Servers
```sh
bun run dev
```

App default URLs:
- API: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3001](http://localhost:3001)
- Marketing: [http://localhost:3002](http://localhost:3002)
- Customer Ordering: [http://localhost:3003](http://localhost:3003)

---

## Scripts Reference

| Command | Action |
|---------|--------|
| `bun run dev` | Start all apps concurrently in development mode |
| `bun run dev:api` | Start only backend API (`apps/api`) |
| `bun run dev:web` | Start only dashboard app (`apps/web`) |
| `bun run dev:client-web` | Start only guest ordering app (`apps/client-web`) |
| `bun run dev:marketing` | Start only marketing landing page (`apps/marketing`) |
| `bun run build` | Build all apps and packages |
| `bun run lint` | Run Biome & ESLint checks across repo |
| `bun run typecheck` | Run TypeScript validation across repo |
| `bun run db:push` | Push Drizzle schema changes directly to DB |
| `bun run db:generate` | Generate Drizzle SQL migration files |
| `bun run db:migrate` | Execute pending Drizzle migrations |
| `bun run db:studio` | Open interactive Drizzle Studio interface |

---

## Documentation Links

- [DOCUMENTATION.md](./DOCUMENTATION.md) — Comprehensive API reference, architecture, database schemas, and event flows.
- [SELFHOST.md](./SELFHOST.md) — Production self-hosting guide, environment configs, PM2, and Nginx reverse proxy.
- [STRUCTURE.md](./STRUCTURE.md) — Monorepo code standards, file organization, and patterns.
- [SECURE-QR-FLOW.md](./SECURE-QR-FLOW.md) — Security model and architecture for dine-in QR ordering sessions.

---

## License

Private / Proprietary. All rights reserved.
