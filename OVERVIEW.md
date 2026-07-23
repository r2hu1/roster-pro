# Roster Pro — Apps Overview

End-to-end type-safe restaurant B2B SaaS monorepo. 4 apps, 4 packages, Turborepo v2, Bun 1.x.

---

## Table of Contents

1. [API (`apps/api`)](#1-api-appsapi)
2. [Web Dashboard (`apps/web`)](#2-web-dashboard-appsweb)
3. [Client-Web (`apps/client-web`)](#3-client-web-appsclient-web)
4. [Marketing (`apps/marketing`)](#4-marketing-appsmarketing)

---

## 1. API (`apps/api`)

Hono server, Drizzle ORM + Postgres, Better Auth, Upstash Redis/Realtime, ImageKit, Polar.sh.

**Port:** 3000 &nbsp;|&nbsp; **Runtime:** Bun (dev via `tsx watch`) &nbsp;|&nbsp; **Build:** tsup → ESM bundle

### Directory Tree

```
apps/api/
├── src/
│   ├── index.ts                  # Server entry — Hono app, basePath /v1, middleware stack, serve
│   ├── app.ts                    # Route registration hub — mounts 7 routers
│   ├── middleware/
│   │   ├── request-logger.ts     # x-request-id, colored method/status/duration logging
│   │   ├── cors.ts               # Dynamic origin allowlist (BETTER_AUTH_URL, CORS_ALLOWED_ORIGINS, localhost dev)
│   │   ├── error.ts              # onError (HTTPException + unhandled), notFound (404 JSON)
│   │   └── session.ts            # Validates session via better-auth, sets user/session/orgId on context
│   ├── core/
│   │   ├── db/
│   │   │   ├── client.ts         # pg Pool singleton (max 10, 30s idle, 10s connect, 15s query timeout)
│   │   │   └── schemas/
│   │   │       ├── index.ts      # Barrel export
│   │   │       ├── auth.ts       # user, session, account, verification, organization, member, invitation
│   │   │       ├── menu.ts       # menu, menu_item (JSONB price {half,full})
│   │   │       ├── table.ts      # table, table_session
│   │   │       └── order.ts      # order (JSONB items + GST fields), order_item, order_counter
│   │   ├── redis/
│   │   │   └── client.ts         # Upstash Redis wrapper (get/set/del/exists/ttl/delPattern/pipeline)
│   │   ├── imagekit/
│   │   │   ├── client.ts         # ImageKit SDK init
│   │   │   ├── upload.ts         # uploadFile(buffer, fileName) → {status, url, id}
│   │   │   └── delete.ts         # deleteFile(id) → {status}
│   │   └── polar/
│   │       └── client.ts         # Polar SDK init (sandbox/production by NODE_ENV)
│   ├── lib/
│   │   ├── better-auth/
│   │   │   └── auth.ts           # betterAuth() config — Drizzle adapter, Google OAuth, org plugin, Polar plugin, Redis secondary storage
│   │   ├── realtime.ts           # Upstash Realtime singleton (null if missing env vars)
│   │   ├── realtime-events.ts    # publishOrderEvent(), publishTableEvent() — typed wrappers
│   │   ├── crypto.ts             # AES-256-GCM encrypt/decrypt (QR tokens), key from ENCRYPTION_KEY
│   │   ├── logger.ts             # routeLogger(app) — prints all registered routes at startup
│   │   ├── utils.ts              # zvalidator() wrapper, parseFile(), HTTP_STATUS_CODES re-export
│   │   └── chippers.ts           # Static map of 1–100 → 11-digit "chipped" phone numbers
│   ├── routes/
│   │   ├── user/
│   │   │   ├── user.route.ts     # GET /me, GET /organization
│   │   │   └── user.logic.ts     # organization() → auth.api.listOrganizations
│   │   └── organization/
│   │       ├── organization.route.ts     # GET /, POST /, PUT / (multipart logo)
│   │       ├── organization.logic.ts     # create/me/update — ImageKit logo upload, org CRUD
│   │       ├── organization.validation.ts # re-exports CreateOrganizationSchema, UpdateOrganizationSchema
│   │       ├── menu/
│   │       │   ├── menu.route.ts          # GET /, GET /:id, POST /, PUT /, DELETE /:id, GET /all/:orgId
│   │       │   ├── menu.logic.ts          # getAll/getById/create/update/getAllWithItems/delete — Redis cache
│   │       │   ├── menu.validation.ts     # re-exports Menu schemas
│   │       │   └── menu-item/
│   │       │       ├── menu-item.route.ts       # GET /:menuId, GET /:id, POST /, PUT /, DELETE /:id
│   │       │       ├── menu-item.logic.ts       # getAllItems/getItemById/createItem/updateItem/deleteItem
│   │       │       └── menu-item.validation.ts  # re-exports MenuItem schemas
│   │       ├── orders/
│   │       │   ├── orders.route.ts        # 13 endpoints (see below)
│   │       │   ├── orders.logic.ts        # Full order lifecycle — cursor pagination, GST calc, Redis cache, realtime events
│   │       │   └── orders.validation.ts   # re-exports Order schemas + local updateOrderStatusSchema
│   │       ├── table/
│   │       │   ├── table.route.ts         # 8 endpoints (see below)
│   │       │   ├── table.logic.ts         # CRUD + QR token generation/decoding, realtime events
│   │       │   └── table.validation.ts    # re-exports Table schemas
│   │       └── analytics/
│   │           ├── analytics.route.ts     # GET /?from=&to=
│   │           ├── analytics.logic.ts     # Summary, revenue (daily/hourly), order breakdown, top items, table stats
│   │           └── analytics.validation.ts # AnalyticsQuerySchema with date refinement
│   └── scripts/
│       └── migrate-to-sessions.ts  # One-time: backfill tableSessionId on legacy orders
├── drizzle.config.ts           # Schema → ../../drizzle, postgresql dialect
├── tsup.config.ts              # ESM, node20 target, bundles @workspace/*
├── vercel.json                 # Build output dist, framework hono
└── package.json
```

### Complete API Endpoints

All mounted under `/v1`.

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST/GET | `/auth/*` | Public | Better Auth handler (Google OAuth, Polar webhooks) |
| GET | `/status` | Public | Health check `{status:"ok"}` |
| GET | `/user/me` | Session | Current user |
| GET | `/user/organization` | Session | User's organization list |
| GET | `/organization` | Session | Org details |
| POST | `/organization` | Session | Create org (multipart) |
| PUT | `/organization` | Session | Update org (multipart) |
| GET | `/organization/analytics?from=&to=` | Session | Date-range analytics |
| GET | `/organization/menu` | Session | List menus |
| GET | `/organization/menu/:id` | Session | Get menu |
| POST | `/organization/menu` | Session | Create menu |
| PUT | `/organization/menu` | Session | Update menu |
| DELETE | `/organization/menu/:id` | Session | Delete menu + cascade items |
| GET | `/organization/menu/all/:organizationId` | Public | All menus with items (customer-facing) |
| GET | `/organization/menu/item/:menuId` | Session | Items by menu |
| GET | `/organization/menu/item/:id` | Session | Get item |
| POST | `/organization/menu/item` | Session | Create item (multipart) |
| PUT | `/organization/menu/item` | Session | Update item (multipart) |
| DELETE | `/organization/menu/item/:id` | Session | Delete item |
| GET | `/organization/orders?limit=&cursor=&status=&search=` | Session | Paginated orders |
| GET | `/organization/orders/stats` | Session | Order status counts |
| GET | `/organization/orders/table/:tableId/active` | Public | Active orders for table |
| GET | `/organization/orders/:id?organizationId=` | Public | Get order |
| POST | `/organization/orders/table/:tableId` | Public | Create/append order to table session |
| POST | `/organization/orders` | Public | Create standalone order |
| PUT | `/organization/orders` | Session | Update order |
| PATCH | `/organization/orders/:id/status` | Session | Update order status |
| DELETE | `/organization/orders/:id` | Session | Delete order |
| GET | `/organization/orders/session/:sessionId/bill` | Session | Session bill |
| POST | `/organization/orders/session/:sessionId/checkout` | Session | Checkout session |
| GET | `/organization/orders/:orderId/invoice?organizationId=` | Public | Generate invoice HTML |
| GET | `/organization/table` | Session | List tables |
| GET | `/organization/table/:id` | Session | Get table |
| POST | `/organization/table` | Session | Create table |
| PUT | `/organization/table` | Session | Update table |
| DELETE | `/organization/table/:id` | Session | Delete table |
| PATCH | `/organization/table/status` | Session | Update table status |
| POST | `/organization/table/token` | Session | Generate QR token |
| GET | `/organization/table/token/decode?token=` | Public | Decode QR token |

### Middleware Stack (order applied)

1. `requestLogger` — request ID, colored logging
2. `corsMiddleware` — origin allowlist + credentials
3. Better Auth handler — `POST/GET /auth/*` (mounted before route-specific middleware)
4. `GET /status` — health check (before session)
5. `sessionMiddleware` — per-route-group, sets user/session/orgId (excludes `/v1/auth/polar/webhooks`)
6. Route handlers
7. `onError` / `notFound` — global error boundary

### Key Patterns

- **3-file pattern:** `{feature}.route.ts` (HTTP handlers) → `{feature}.logic.ts` (business logic) → `{feature}.validation.ts` (Zod re-exports from `@workspace/shared`)
- **Redis caching:** 300s TTL on menus, menu items, orders, tables. Invalidation via `delPattern()` (SCAN-based). Graceful degrade if Redis missing.
- **Realtime:** Upstash Realtime pub/sub. Channels: `orders:{orgId}`, `order:{orderId}`, `table:{orgId}`, `analytics:{orgId}`. Events published after DB mutations.
- **GST:** 5% default rate on org, calculated as CGST+SGST (intra-state) or IGST (inter-state). Fields on order: `taxableAmount`, `cgstAmount`, `sgstAmount`, `igstAmount`, `roundOff`, `gstRate`.
- **QR tokens:** AES-256-GCM encrypted JSON `{ organization, table }`. Decoded via `GET /table/token/decode`.
- **Invoice:** Server-generated HTML receipts with thermal-printer-friendly layout.

### Dependencies (key)

hono, @hono/node-server, @hono/zod-validator, better-auth, @polar-sh/better-auth, @polar-sh/sdk, drizzle-orm, drizzle-kit, pg, @upstash/redis, @upstash/realtime, @imagekit/nodejs, zod, jsonwebtoken, chalk, uuid

---

## 2. Web Dashboard (`apps/web`)

Restaurant owner dashboard. Next.js 16 App Router, TanStack Query, Axios, Upstash Realtime.

**Port:** 3001 &nbsp;|&nbsp; **Runtime:** Next.js 16.2.6, React 19.2.4 &nbsp;|&nbsp; **Styling:** Tailwind v4, shadcn/ui via `@workspace/ui`

### Directory Tree

```
apps/web/
├── app/
│   ├── layout.tsx                   # Root: fonts, TooltipProvider, RealtimeProvider, Toaster (sonner)
│   ├── page.tsx                     # Server component — checks session → org → subscription, redirects
│   ├── error.tsx                    # Client error boundary, auto-reload every 5s
│   ├── (dashboard)/
│   │   └── layout.tsx              # SessionProvider > SubscriptionMiddleware > DashboardShell
│   │   └── [Id]/
│   │       ├── layout.tsx          # Pass-through
│   │       ├── page.tsx            # → OrdersPageView (default dashboard page)
│   │       ├── tables/page.tsx
│   │       ├── menus/page.tsx
│   │       ├── menus/[menuId]/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── receipts/page.tsx
│   │       ├── settings/page.tsx   # Empty placeholder
│   │       └── subscribe/page.tsx  # Upgrade to Pro upsell
│   ├── (kitchen)/
│   │   └── layout.tsx              # SessionProvider > SubscriptionMiddleware (no sidebar)
│   │   └── [Id]/
│   │       └── kitchen/page.tsx    # → KitchenDisplayView
│   ├── (onboarding)/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # SessionProvider wrapper
│   │   │   └── login-or-signup/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── onboarding/subscription/page.tsx
│   │   ├── onboarding/success/page.tsx
│   │   └── onboarding/error/page.tsx
│   └── api/
│       └── realtime/route.ts       # Upstash Realtime SSE endpoint — validates org via cookie, channel auth
├── modules/                        # Feature-organized modules
│   ├── orders/
│   │   ├── api/orders.ts           # All order API calls (fetchOrders, fetchOrderStats, createOrder, etc.)
│   │   ├── hooks/
│   │   │   ├── use-orders-stream.ts       # Realtime order list with cursor pagination, filter, bell sound, stats refresh
│   │   │   ├── use-order-stream.ts        # Single order realtime subscription
│   │   │   └── use-orders-mutations.ts    # useCreateOrder, useUpdateOrder, useDeleteOrder
│   │   └── views/ui/
│   │       ├── orders-page-view.tsx       # Real-time order list with infinite scroll
│   │       ├── kitchen-display-view.tsx   # Full-screen kitchen display
│   │       ├── kitchen-order-card.tsx     # Kitchen card with inline status buttons
│   │       ├── load-more-sentinel.tsx     # Shared infinite scroll trigger
│   │       ├── order-card.tsx
│   │       ├── order-items-list.tsx
│   │       ├── order-totals-summary.tsx
│   │       ├── order-status-controls.tsx
│   │       ├── orders-stats.tsx
│   │       ├── orders-filters.tsx
│   │       ├── orders-info.tsx            # Order detail sheet
│   │       ├── orders-constants.ts        # Status/payment style maps
│   │       ├── create-manual-order-responsive-modal.tsx
│   │       └── print-recipts-version-responsive-modal.tsx
│   ├── tables/
│   │   ├── api/tables.ts           # fetchTables, createTable, updateTable, etc.
│   │   ├── hooks/use-table-status-stream.ts  # Realtime table status
│   │   └── views/ui/
│   │       ├── tables-page-view.tsx
│   │       ├── table-card.tsx
│   │       ├── table-stats.tsx
│   │       ├── table-qr-code.tsx
│   │       ├── create-table-responsive-modal.tsx
│   │       ├── update-table-responsive-modal.tsx
│   │       └── delete-table-modal.tsx
│   ├── menus/
│   │   └── views/ui/
│   │       ├── menus-page-view.tsx
│   │       ├── menu-card.tsx
│   │       ├── create-menu-responsive-modal.tsx
│   │       ├── edit-menu.tsx
│   │       ├── delete-menu.tsx
│   │       └── menu-item/
│   │           ├── menu-item-page-view.tsx
│   │           ├── menu-item-card.tsx
│   │           ├── menu-item-info.tsx
│   │           ├── create-menu-item-responsive-modal.tsx
│   │           ├── edit-menu-item.tsx
│   │           └── delete-menu-item.tsx
│   ├── analytics/
│   │   ├── api/analytics.ts        # fetchAnalytics(from, to)
│   │   └── views/ui/
│   │       ├── analytics-page-view.tsx
│   │       └── charts/
│   │           ├── orders-revenue-chart.tsx
│   │           ├── hourly-revenue-pie-chart.tsx
│   │           ├── top-items-list.tsx
│   │           ├── peak-hour-and-busiest-table-chart.tsx
│   │           └── table-stats-list.tsx
│   ├── receipts/
│   │   └── views/ui/
│   │       ├── receipts-page-view.tsx
│   │       ├── receipts-data-table.tsx   # TanStack Table, paginated
│   │       ├── print-receipt.ts          # generateReceiptHtml(), printReceipt()
│   │       └── print-receipt-button.tsx
│   ├── sidebar/
│   │   └── views/ui/
│   │       ├── sidebar.tsx               # AppSidebar — logo, search, NavMain, NavUser
│   │       ├── nav-main.tsx
│   │       ├── nav-secondary.tsx
│   │       ├── nav-user.tsx
│   │       └── kitchen-mode-toggle.tsx   # Kitchen display link
│   ├── onboarding/
│   │   └── views/ui/
│   │       ├── auth/auth-page-view.tsx   # Google OAuth sign-in
│   │       ├── onboarding-page-view.tsx  # Restaurant setup form
│   │       ├── subscription/subscription-page-view.tsx  # Trial/Premium plans
│   │       └── subscription/success/success-page-view.tsx
│   ├── settings/
│   │   └── views/ui/settings-page-view.tsx  # Empty placeholder
│   └── providers/
│       ├── session-provider.tsx          # SessionContext — user, org, loading
│       ├── query-client.tsx              # React Query provider
│       └── subscription-middleware.tsx   # Subscription check → redirect to /subscribe
├── components/
│   ├── dashboard-shell.tsx          # SidebarProvider + AppSidebar
│   ├── page-header.tsx              # Reusable header with title/description/actions
│   ├── realtime-provider.tsx        # Upstash RealtimeProvider (max 20 reconnects)
│   ├── logo.tsx
│   ├── qr-code.tsx
│   ├── success-ripple.tsx
│   ├── preloader.tsx
│   ├── empty.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── axios.ts                     # Axios instance: base /api/, withCredentials, Bearer token interceptor
│   ├── realtime-client.ts           # Client-side Upstash Realtime hook
│   ├── realtime-server.ts           # Server-side Realtime + Redis singleton
│   └── better-auth/client.ts        # better-auth client with org + Polar plugins
├── public/
│   ├── assets/                      # 9 images + 1 bell.wav audio
│   └── audios/bell.wav              # New-order notification sound
├── next.config.ts                   # API rewrites /api/* → API_URL/v1/*, ImageKit remote images
└── package.json
```

### Rewrites

`/api/:path*` → `API_URL/v1/:path*` (dev default `http://localhost:3000`)

### Key Patterns

- **Pages are server components** — client interactivity via `"use client"` subcomponents in modules
- **Module-per-feature** — each domain has `api/` (fetchers), `hooks/` (queries/mutations/streams), `views/ui/` (components)
- **Realtime-first** — Upstash Realtime SSE for orders (cursor pagination + live updates), table status; auto-reconnect with snapshot refetch
- **Kitchen Mode** — fullscreen order view, hides sidebar, shows live clock + connection status + bell sounds
- **Session cascade** — `page.tsx` checks session → org existence → active subscription → redirect accordingly

### Dependencies (key)

next 16.2.6, react 19.2.4, @tanstack/react-query ^5.101.2, @tanstack/react-table ^8.21.3, axios, better-auth, @polar-sh/better-auth, @polar-sh/sdk, @upstash/realtime, @upstash/redis, recharts, framer-motion, sonner, nuqs, date-fns, qr-code-styling, canvas-confetti, @tabler/icons-react, @workspace/shared, @workspace/ui

---

## 3. Client-Web (`apps/client-web`)

Customer-facing menu ordering. QR-code-driven — table token decodes to org + table.

**Port:** 3003 &nbsp;|&nbsp; **Runtime:** Next.js 16.2.6, React 19.2.4 &nbsp;|&nbsp; **Styling:** Tailwind v4, shadcn/ui via `@workspace/ui`

### Directory Tree

```
apps/client-web/
├── app/
│   ├── layout.tsx                   # Root: Geist font, globals.css, "A RosterPro Partner"
│   ├── page.tsx                     # Redirect to last-visited token or marketing site
│   └── [token]/
│       ├── layout.tsx               # ReactQueryProvider > TableProvider > CartProvider > OrdersStreamProvider + Header/Footer/Toaster
│       ├── page.tsx                 # ViewTypeProvider > MenuPageView + ResponsiveOrdersStatus
│       └── cart/page.tsx            # CartPageView
├── modules/
│   ├── cart/
│   │   └── views/
│   │       ├── provider/cart-provider.tsx          # Cart context — items, add/remove/update/clear, localStorage persistence
│   │       └── ui/
│   │           ├── cart-page-view.tsx              # Full-page cart
│   │           ├── cart-sheet.tsx                  # Slide-over cart sheet
│   │           └── responsive-placing-order.tsx     # Multi-phase order flow: confirm → placing → success/error
│   ├── menu/
│   │   └── views/
│   │       ├── providers/view-type.tsx             # Grid/list view toggle context
│   │       └── ui/
│   │           ├── menu-page-view.tsx              # Virtualized menu list with category tabs, search, scroll sync
│   │           ├── menu-virtual-row.tsx            # Virtual row renderer (header or items grid)
│   │           ├── menu-filter-bar.tsx             # Sticky search + category tabs + view toggle
│   │           ├── manu-card.tsx                   # Item card (grid/list variants)
│   │           └── responsive-item-modal.tsx       # Item detail modal (price, qty, add to cart)
│   ├── orders/
│   │   └── views/
│   │       ├── providers/orders-stream.tsx         # OrdersStream context — wraps active-orders hook
│   │       └── ui/
│   │           ├── responsive-orders-status.tsx    # Orders status modal with item breakdown
│   │           └── ripple-button.tsx               # FAB with ripple animation → opens orders modal
│   └── providers/
│       ├── query-client.tsx                        # TanStack QueryProvider
│       └── table-provider.tsx                      # Decodes token, provides org context, saves to localStorage
├── components/
│   ├── header.tsx                     # Org logo/name/phone + cart badge
│   ├── footer.tsx                     # Org + RosterPro credits, share button, marketing link
│   ├── preloader.tsx                  # Fullscreen loading spinner
│   ├── roster-logo.tsx               # Logo component (icon/full variants)
│   └── success-ripple.tsx            # Animated success checkmark + confetti
├── hooks/
│   ├── use-decode-token.ts           # GET /api/organization/table/token/decode?token=
│   ├── use-menus.ts                  # GET /api/organization/menu/all/:organizationId
│   ├── use-create-order.ts           # POST /api/organization/orders
│   ├── use-create-table-order.ts     # POST /api/organization/orders/table/:tableId
│   ├── use-order.ts                  # GET /api/organization/orders/:id
│   ├── use-update-order.ts           # PUT /api/organization/orders
│   ├── use-active-orders.ts          # GET /api/organization/orders/table/:tableId/active
│   └── use-active-orders-stream.ts   # Polling hook (10s interval), dedup Map, connection state
├── lib/
│   ├── axios.ts                      # Axios: base /api/, Bearer token from localStorage
│   └── realtime-server.ts            # Server-side Upstash Realtime client (unused in client-web)
├── docs/
│   └── API_INTEGRATION_GUIDE.md      # 5-endpoint API reference for customer flow
├── next.config.ts                    # Rewrites /api/* → API_URL/v1/*, ImageKit remote images
└── package.json
```

### Rewrites

`/api/:path*` → `API_URL/v1/:path*` (dev default `http://localhost:3000`)

### Data Flow

```
User scans QR → /[token] page
  → useDecodeToken(token) → { organization, table }
  → TableProvider context → saves last-visited to localStorage
  → useMenus(orgId) → menu list with items
  → MenuPageView → user browses items
  → Add to Cart → CartProvider (localStorage persisted)
  → Cart → ResponsivePlacingOrder
    → useCreateTableOrder({ tableId, data }) → POST /api/.../table/:tableId
    → success → confetti, clear cart
  → RippleButton → ResponsiveOrdersStatus → useActiveOrders(tableId) → live order status
```

### Dependencies (key)

next 16.2.6, react 19.2.4, @tanstack/react-query ^5.101.2, @tanstack/react-virtual ^3.14.5, axios, better-auth, @upstash/realtime, @upstash/redis, framer-motion, sonner, react-hook-form, react-masonry-css, canvas-confetti, @tabler/icons-react, lucide-react, @workspace/shared, @workspace/ui

---

## 4. Marketing (`apps/marketing`)

Public landing site. No API dependency, no auth.

**Port:** 3002 &nbsp;|&nbsp; **Runtime:** Next.js 16.2.6, React 19.2.4 &nbsp;|&nbsp; **Styling:** Tailwind v4, shadcn/ui via `@workspace/ui`

### Directory Tree

```
apps/marketing/
├── app/
│   ├── layout.tsx                   # Root: Instrument Sans + Geist Mono fonts, metadata "RosterPro", Header + Footer
│   ├── page.tsx                     # LandingPage (Hero, Stats, Features, Testimonials, CTA)
│   ├── about/page.tsx               # AboutPage
│   ├── contact/page.tsx             # ContactPage (form + contact info)
│   ├── documentation/page.tsx       # DocumentationPage (setup steps + FAQ accordion)
│   ├── privacy-policy/page.tsx      # PrivacyPolicy (13 sections, sticky sidebar nav)
│   └── terms/page.tsx               # TermsAndConditions (19 sections, sticky sidebar nav)
├── modules/
│   └── home/views/ui/
│       ├── index.tsx                # LandingPage composer — Hero + Stats + Features + Testimonials + CTA
│       ├── hero.tsx                 # "The Complete Operating System for Modern Restaurants" + CTA buttons
│       ├── features.tsx             # 6 feature cards (Menu, QR, GST Billing, Tables, KDS, Analytics)
│       ├── stats.tsx                # 3 stat cards (2,570 restaurants, 24L+ orders, 4.2CR+ revenue)
│       ├── testimonials.tsx         # 6 testimonial cards with randomuser avatars
│       ├── cta.tsx                  # Shader canvas background (Dithering) + CTA button
│       ├── about.tsx                # "Built for restaurants, by restaurant people" + 4 stat badges
│       ├── about_page.tsx           # Full about page with story + values + team stats
│       ├── contact_page.tsx         # Contact methods + form
│       ├── documentation_page.tsx   # 4 setup step cards + 6 FAQ accordion items
│       ├── privacy_policy.tsx       # Comprehensive privacy policy
│       ├── terms&cond.tsx           # Comprehensive terms & conditions
│       ├── header.tsx               # Sticky nav with mobile hamburger
│       ├── logo.tsx                 # Logo component (full logo image)
│       ├── footer.tsx               # 4 link groups + copyright
│       └── nav-links.ts             # Shared nav link data
├── components/
│   └── theme-provider.tsx           # next-themes wrapper (unused in layout)
├── public/assets/                   # 11 images (logos, product screenshots)
└── package.json
```

### Key Characteristics

- **Static content** — no API calls, no auth, no data fetching
- **Thin pages** — app routes are 1-liner wrappers that delegate to module components
- **Shader effects** — `@paper-design/shaders-react` for CTA section background
- **Legal pages** — privacy policy (13 sections) and terms (19 sections) with sticky sidebar navigation
- **Workspace deps only** — `@workspace/ui`, `@workspace/eslint-config`, `@workspace/typescript-config` (no `@workspace/shared`)

### Dependencies (key)

next 16.2.6, react 19.2.4, @tabler/icons-react, lucide-react, next-themes, @paper-design/shaders-react, @workspace/ui

---

## Cross-App Comparison

| Aspect | API | Web | Client-Web | Marketing |
|--------|-----|-----|------------|-----------|
| Port | 3000 | 3001 | 3003 | 3002 |
| Purpose | Backend server | Owner dashboard | Customer ordering | Landing pages |
| Auth | Better Auth (session) | Session-based | Token-based (QR) | None |
| API calls | Serves them | Axios → API rewrites | Axios → API rewrites | None |
| Realtime | Publisher (Upstash) | Subscriber (SSE) | Polling (10s) | None |
| State mgmt | — | React Query | React Query | None |
| Complexity | High (14 tables, 39 endpoints, caching, realtime) | High (8 route groups, 9 modules, 4 providers, realtime) | Medium (3 routes, 4 modules, 8 hooks) | Low (6 pages, 1 module, 0 hooks) |
| Workspace deps | shared | shared, ui | shared, ui | ui only |
| TypeScript | 5.8.3 | ^5 | ^5 | ^5 |

---

## Shared Conventions Across All Apps

- **Rewrite proxy:** Web + Client-Web both proxy `/api/*` → `API_URL/v1/*` via `next.config.ts`
- **UI library:** All apps use `@workspace/ui` for shadcn components (Button, Input, Sheet, Modal, etc.)
- **Styling:** Tailwind v4 + `@workspace/ui/globals.css` (shared CSS)
- **Linting:** Biome v2 for lint/format; ESLint 9 for framework rules (via `@workspace/eslint-config`)
- **PostCSS:** All apps delegate to `@workspace/ui/postcss.config`
- **TypeScript config:** All apps extend `@workspace/typescript-config/nextjs.json`
- **shadcn config:** All apps use `components.json` pointing to `@workspace/ui` for components/utils
