# Documentation — Roster Pro

Technical specification, architectural deep-dive, API reference, and development guide for Roster Pro.

For quick product overview, see [README.md](./README.md).  
For self-hosting and deployment, see [SELFHOST.md](./SELFHOST.md).  
For internal codebase organization and conventions, see [STRUCTURE.md](./STRUCTURE.md).  
For QR table session security model, see [SECURE-QR-FLOW.md](./SECURE-QR-FLOW.md).

---

## 1. System Overview

Roster Pro is an end-to-end type-safe B2B restaurant management platform. It combines:
- **Centralized Restaurant Management**: Dashboard for owners, floor managers, and staff to run menus, floor tables, kitchen orders, and sales metrics.
- **Guest Dine-In Experience**: Mobile web interface for scanning table QR codes, browsing menus with item variations, ordering, and tracking status.
- **High-Throughput API**: Bun + Hono REST backend with PostgreSQL, Drizzle ORM, and Upstash Redis.
- **Realtime Kitchen & Order Flow**: Upstash Realtime (Redis Pub/Sub) keeping customer UI and restaurant dashboard synchronized.

---

## 2. Monorepo Architecture

Managed via **Turborepo v2** and **Bun**:

```
roster-pro/
├── apps/
│   ├── api/            # Port 3000: Hono HTTP API, Drizzle ORM, Redis, Auth
│   ├── web/            # Port 3001: Next.js 16 Restaurant Admin Dashboard
│   ├── client-web/     # Port 3003: Next.js 16 Customer QR Ordering App
│   └── marketing/      # Port 3002: Next.js 16 Public Landing & Marketing Page
├── packages/
│   ├── shared/         # Zod schemas, TypeScript types, DTO contracts, enums
│   ├── ui/             # Shared shadcn/ui components & Tailwind styling
│   ├── eslint-config/  # Shared ESLint configuration presets
│   └── typescript-config/ # Base tsconfig presets
└── drizzle/            # Generated PostgreSQL database migrations
```

### Shared Type Contract Pattern
`packages/shared` serves as the single source of truth for both server validation and client data fetching:
- API routes validate request bodies, queries, and params via `@workspace/shared` Zod schemas (`zValidator`).
- Web and Client-Web apps infer form and payload types directly from the same schemas.

---

## 3. Data Model & Database Schema

All database models reside in `apps/api/src/core/db/schemas/`:

### Authentication & Organizations (`auth.ts`)
- **`user`**: `id`, `name`, `email`, `emailVerified`, `image`, timestamps.
- **`session`**: `id`, `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent`, `activeOrganizationId`.
- **`organization`**: `id`, `name`, `slug`, `logo`, `metadata` (JSONB address, phone, GST rate, currency).
- **`member`**: `id`, `organizationId`, `userId`, `role` (`owner`, `admin`, `member`), timestamps.
- **`invitation`**: Org team invitations tracking token, role, and expiration.

### Menu Management (`menu.ts`)
- **`menu`**: Categorical groupings (e.g., "Starters", "Mains", "Drinks"). Tied to `organizationId`.
- **`menu_item`**: Dish records with name, description, image URL, category, availability toggle, and `price` (JSONB `{ half?: number, full?: number }`).

### Floor & Table Management (`table.ts`)
- **`table`**: Represents a physical table (`tableNumber`, `capacity`, `qrToken`, `status`: `available | occupied | reserved`).
- **`table_session`**: Tracks an active dine-in session (`tableId`, `organizationId`, `startedAt`, `endedAt`, `totalAmount`).

### Orders & Kitchen Flow (`order.ts`)
- **`order`**: Individual table order ticket (`orderNumber`, `tableId`, `organizationId`, `status`, `items`, `subtotal`, `gst`, `total`, `paymentStatus`).
- **Order Statuses**: `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `SERVED` → `COMPLETED` (or `CANCELLED`).

---

## 4. API Specification & Endpoints

Base URL: `http://localhost:3000/v1`

### Authentication (`/auth/*`)
Handled by Better Auth mounted at `/auth/*`:
- `GET/POST /auth/sign-in/social?provider=google`
- `GET/POST /auth/sign-out`
- `GET /auth/session`

### Organizations (`/v1/organization`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `GET` | `/v1/organization/me` | Fetch active organization profile | Session |
| `POST` | `/v1/organization` | Create a new organization | Session |
| `PUT` | `/v1/organization` | Update org profile, metadata, or logo | Session |

### Menus & Items (`/v1/organization/menu`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `GET` | `/v1/organization/menu` | List all menus for org | Session |
| `POST` | `/v1/organization/menu` | Create a new menu category | Session |
| `PUT` | `/v1/organization/menu` | Update menu | Session |
| `DELETE` | `/v1/organization/menu/:id` | Delete menu category | Session |
| `GET` | `/v1/organization/menu/all/:orgId` | Public fetch of full menu with items | Public |
| `GET` | `/v1/organization/menu/menu-item/:menuId` | List items within a menu | Session |
| `POST` | `/v1/organization/menu/menu-item` | Create a dish/item | Session |
| `PUT` | `/v1/organization/menu/menu-item` | Update a dish/item | Session |
| `DELETE` | `/v1/organization/menu/menu-item/:id` | Delete a dish/item | Session |

### Tables & QR Tokens (`/v1/organization/table`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `GET` | `/v1/organization/table` | List all tables for org | Session |
| `POST` | `/v1/organization/table` | Add new table | Session |
| `PUT` | `/v1/organization/table` | Update table details | Session |
| `DELETE` | `/v1/organization/table/:id` | Remove table | Session |
| `POST` | `/v1/organization/table/token` | Generate encrypted AES-256 QR token | Session |
| `GET` | `/v1/organization/table/token/decode` | Decode QR token to resolve org & table | Public / Client |

### Orders (`/v1/organization/orders`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `GET` | `/v1/organization/orders` | Cursor-paginated kitchen orders list | Session |
| `GET` | `/v1/organization/orders/:id` | Order details | Session |
| `POST` | `/v1/organization/orders/table/:tableId` | Place new order for table | Public / Session |
| `PATCH` | `/v1/organization/orders/:id/status` | Update order preparation/fulfillment status | Session |
| `GET` | `/v1/organization/orders/table/:tableId/active` | Get active table orders | Public / Session |
| `GET` | `/v1/organization/orders/:orderId/invoice` | Generate printable receipt/invoice | Public / Session |

### Analytics (`/v1/organization/analytics`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `GET` | `/v1/organization/analytics/overview` | Revenue, order counts, top items | Session |

---

## 5. Realtime Architecture

Realtime updates leverage Upstash Redis channels:
1. When an order status updates or a new order arrives, API publishes an event:
   ```ts
   publishOrderEvent({ organizationId, event: "ORDER_CREATED", data: order });
   ```
2. Frontend dashboards and customer screens subscribe via client-side SSE/WebSocket listeners:
   - `order:created`
   - `order:status_updated`
   - `table:status_updated`
3. Reduces database polling and provides instant kitchen ticket printing / status displays.

---

## 6. Security Model

- **Session Security**: Better Auth session tokens stored in secure `httpOnly` cookies, cached in Redis secondary storage.
- **QR Protection**: QR tokens are AES-256-GCM encrypted strings containing table and org identifiers. For enhanced rotation and ephemeral sessions, see [SECURE-QR-FLOW.md](./SECURE-QR-FLOW.md).
- **CORS Protection**: Dynamic origin validation strictly checking dashboard, client app, and marketing domains.
- **Header Hardening**: `x-request-id` generated for every request and logged across lifecycle.
