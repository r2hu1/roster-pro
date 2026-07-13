# Roster Pro — Production Readiness Plan

Prioritized remediation plan from production-readiness audit. Three tracks: ship-blockers, scalability foundations, long-term hardening.

---

## Track A — Ship-Blockers (do before serving real traffic)

| # | Item | Problem | Fix | Effort | Owner |
|---|------|---------|-----|--------|-------|
| A1 | `trustedOrigins: ["*"]` | Any site can initiate OAuth — CSRF bypass | Set to explicit origins from `BETTER_AUTH_URL` env var | S | Backend |
| A2 | No rate limiting | Auth + public endpoints open to brute force | Add `hono-rate-limiter` with Redis backing, 10 req/s per IP on auth routes | S | Backend |
| A3 | Remove `install`, `npm`, `v4` deps | Supply-chain risk (install is abandoned package), dead dependencies | `bun remove install npm v4` from affected packages | S | Anyone |
| A4 | API key middleware commented out | All internal endpoints have zero auth check | Either implement correctly or delete the dead file | S | Backend |
| A5 | No CI pipeline | Every deploy is manual, untested, unverified | Add GitHub Actions: `bun install`, `bun run typecheck`, `bun run lint`, smoke test | M | Infra |

---

## Track B — Scalability Foundations (next 2–6 weeks)

| # | Item | Problem | Fix | Effort | Impact | Risk if ignored |
|---|------|---------|-----|--------|--------|----------------|
| B1 | Zero tests | Cannot refactor safely | Install vitest, add test script to turbo.json, write shared schema validation tests + 1 API integration test | M | Team velocity triples | Schema-drift rot, every PR risky |
| B2 | Analytics loads all orders in memory | OOMs at ~50k orders | SQL-level aggregation (GROUP BY date/hour), streaming cursor for item iteration | M | Survives growth | First production incident |
| B3 | React version mismatch | ui has `^19.2.7`, apps pin `19.2.4` | Pin all to same React version via workspace protocol | S | Eliminates runtime hook errors | Intermittent UI bugs |
| B4 | Inconsistent import paths | 3 files still use `@workspace/shared/types/` backward-compat path | Migrate to canonical `@workspace/shared/schemas/*` | S | Consistent conventions | Dead import paths accumulate |
| B5 | No observability | Blind in production | Add Sentry/OpenTelemetry, replace `console.log` with structured logger, add request duration metric | M | Can diagnose issues | Incident response is guesswork |
| B6 | SCAN-based cache invalidation | Slow on busy Redis | Replace `delPattern` with mutation-specific key deletion (track written keys) | M | Cache stays fast | Redis CPU spikes under traffic |
| B7 | Dead review schemas + outdated docs | Review schemas have no routes; SSE pattern in old docs not used | Either implement review or archive schemas; align docs with actual `@upstash/realtime` | S | Documentation truth | Onboarding friction |
| B8 | `@base-ui/react` + `radix-ui` collision | Two competing UI primitives in one package | Choose one ecosystem, remove the other | M | Consistent UI | Component conflicts, bundle bloat |
| B9 | Public menu endpoint unprotected | `GET /organization/menu/all/:orgId` has no session check | Add rate limiting if intentional; add auth if not | S | Prevents data scraping | Data leak |
| B10 | CORS on auth routes | Auth handler registered via `.on()` not `.use()` — may bypass CORS | Verify CORS applies to auth or add explicit origin check | S | Consistent auth security | CORS bypass for auth |

---

## Track C — Long-Term Hardening (quarter-scale)

| # | Item | Problem | Fix | Effort | Impact | Risk if ignored |
|---|------|---------|-----|--------|--------|----------------|
| C1 | Monolith API scaling | Single Hono process handles everything | Split: public (menus) vs admin (orders) services, or add worker threads for analytics | L | Independent scaling | Monolith limits burst capacity |
| C2 | No deployment pipeline | No staging, rollback, canary | Vercel + GitHub Actions: Preview on PR, staging on merge, prod with rollback cap | L | Repeatable deploys | Human error during deploys |
| C3 | No contract testing | Schema drift between shared and API responses | Add zod-to-openapi generation + API spec validation in CI | M | Catches response mismatches | Unnoticed breaking changes |
| C4 | No ownership model | No CODEOWNERS, no independent versioning | Add CODEOWNERS per package, extract `ui` to independent changelog | L | Team scales | Merge bottlenecks |
| C5 | Redis + DB connection hardening | Single pool, no circuit breaker | Add pool monitoring, circuit breaker (Opossum), read replicas for analytics | L | Zero-downtime under load | Cascade failure |
| C6 | No E2E tests | Cannot verify cross-service flows | Playwright for dashboard flows, API integration suite with test DB | L | Shipping confidence | Regressions in customer flows |
| C7 | Encryption key derivation | SHA-256 of arbitrary string is non-standard | Use 32 raw bytes from env or proper KDF (PBKDF2/Argon2) | S | Cryptographic strength guarantee | Weaker than expected encryption |
| C8 | Upstash lock-in | Realtime + Redis both tied to single vendor | Abstract behind interfaces, add fallback (local Redis for dev) | M | Vendor optionality | Migration cost if pricing changes |
| C9 | Missing API versioning strategy | `/v1` prefix exists but no versioning policy | Document breaking change policy, add version header negotiation | S | Clear API contract | Accidental breaking changes |

---

## Do This Today (1-week shortlist)

Highest-leverage actions if one week before going live:

1. **Fix `trustedOrigins: ["*"]`** — `apps/api/src/lib/better-auth/auth.ts:21`. Set to `BETTER_AUTH_URL`. 10 min, prevents CSRF account takeover.
2. **Remove `install`, `npm`, `v4` deps** — `bun remove install npm v4 -a`. 2 min, eliminates supply-chain risk.
3. **Add GitHub Actions CI** — one YAML: `bun install`, `bun run typecheck`, `bun run lint`. 2 hours, verifies every PR.
4. **Delete or implement API key middleware** — `apps/api/src/middleware/api.ts`. 5 min, removes dead auth bypass path.
5. **Add rate limiting to auth routes** — wrap Better Auth handler with `hono-rate-limiter`. 1 hour, prevents brute force.
