# Financial Tracker Planning

## Master Build Prompt

**`GEMINI.md`** (root) is the single entry point for AI vibe coders. It contains:
- Complete locked tech stack
- All environment variables
- Target Prisma schema (with approved additions)
- Complete seed data spec
- Accounting rules
- File manifest (100+ files in build order)
- TypeScript types
- Shared Zod validators
- Auth implementation
- Soft-delete Prisma extension
- Utility functions
- AI prompt templates (copy-paste ready)
- Route protection map
- ASCII wireframes
- Pagination pattern
- Report query pattern
- Cron job setup
- Docker deployment configs
- Build order (20 phases)

Read `GEMINI.md` first. Use `planning/` for detailed specs.

---

## Planning Documents

| Doc | Title | Covers |
|---|---|---|
| `01-product-scope.md` | Product scope + onboarding | Vision, user persona, JTBD, in/out scope, MVP, onboarding flow |
| `02-feature-requirements.md` | Features + settings + recurring + templates | All 6 pillars detailed, settings page, recurring transactions, transaction templates |
| `03-data-model-and-rules.md` | Data model + income accounting | Schema rules, balance computation, transfers, soft deletes, audit log, CategoryType enum |
| `04-api-plan.md` | API routes + validation | Route map, Zod schemas, service layer, error responses, auth details, monitoring, indexes |
| `05-ai-and-email-plan.md` | AI + email integration | Categorizer flow/prompts, LLM provider strategy, email parser, Gmail OAuth, duplicate detection, monthly advice |
| `06-ui-ux-plan.md` | UI/UX + libraries + PWA + state | Layout strategy, component decisions, Tailwind/shadcn/Recharts, TanStack Query/Zustand/nuqs, PWA/offline, dark mode, accessibility, i18n |
| `07-reporting-plan.md` | Reports + cron + multi-currency | Core metrics, 7 report types, MonthlySummary generation, cron implementation, multi-currency UX |
| `08-implementation-roadmap.md` | Build phases + folder structure + deployment | 7 phases, MVP cut line, folder structure, Docker configs, environment variables, backup/restore |
| `09-testing-and-quality.md` | Testing + security + a11y audit | Unit/integration/E2E tests, QA checklist, performance targets, security checks, Playwright a11y |

---

## Schema Changes (Approved)

3 additions to original locked schema — already reflected in `GEMINI.md` target schema:

| Change | Purpose |
|---|---|
| `CategoryType` enum + `type` field on Category | Income/expense classification |
| `Setting` model | User preferences, onboarding state, email tokens |
| `RecurringTransaction` model | Recurring bill/subscription templates |

---

## Tech Stack Summary

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| CSS | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Data Fetching | TanStack Query v5 |
| State | Zustand + nuqs |
| Tables | TanStack Table v8 |
| Toasts | Sonner |
| DB | PostgreSQL 16 + Prisma 6 |
| Auth | iron-session + argon2 |
| LLM | OpenRouter (Gemini Flash + Claude Sonnet) |
| PWA | Serwist |
| Testing | Vitest + Playwright + axe-core |
| Deploy | Docker + Traefik on Oracle VPS |
