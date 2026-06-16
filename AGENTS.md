# Financial Tracker — Agent Instructions

## Entry Points by Tool

| Tool | Primary File | Read First |
|---|---|---|
| Cursor | `.cursorrules` | Then `GEMINI.md` |
| Claude Code | `CLAUDE.md` | Then `GEMINI.md` |
| Gemini | `GEMINI.md` | Self-contained |
| Copilot | `AGENTS.md` (this file) | Then `GEMINI.md` |
| Generic | `GEMINI.md` | Complete spec |

## Project Overview

Personal finance tracker for a single user in Jakarta, Indonesia.
Self-hosted on Docker + Oracle VPS. PostgreSQL + Next.js 16 + Prisma.

## Absolute Rules (All Tools)

1. **Read `GEMINI.md` before writing any code** — it is the single source of truth
2. **Never store balance on Account** — always compute from transactions
3. **Never hard-delete** — soft-delete only (`deleted_at`)
4. **Transfers = 2 rows** in one `prisma.$transaction()` call
5. **Zod validates before Prisma** on every API route — no exceptions
6. **AI never receives raw transactions** — only aggregated monthly summaries
7. **Amount is always positive** — `type` field (debit/credit) defines direction
8. **Income/expense classified by `Category.type`** — not by transaction type
9. **IDR is primary currency** — no decimal cents
10. **All queries filter `deleted_at: null`** — use Prisma extension

## File Structure

```
GEMINI.md          ← Complete build spec (schema, types, manifest, prompts)
CLAUDE.md          ← Claude Code specific rules
AGENTS.md          ← This file (generic agent entry)
.cursorrules       ← Cursor specific rules
DESIGN.md          ← Visual design system (colors, typography, components)
planning/          ← Detailed feature specs (9 docs)
prisma/            ← Schema, migrations, seed
src/
  app/             ← Next.js pages + API routes
  components/      ← UI components
  lib/             ← Core utilities, services, AI, email
  hooks/           ← React hooks
  stores/          ← Zustand stores
  types/           ← Shared TypeScript types
```

## Build Phases

1. Schema + seed + foundation libs
2. API routes
3. Service layer
4. UI components (shadcn/ui + custom)
5. Pages
6. Hooks + stores
7. PWA
8. Docker deployment (user manages reverse proxy)
9. Testing

## Quick Reference

- **Auth:** iron-session, argon2 passwords, 30-day cookie
- **DB queries:** Prisma client for CRUD, `$queryRaw` for aggregations
- **Validation:** Zod v4 schemas in `src/lib/validators.ts`
- **Formatting:** `formatIDR()` / `formatDate()` in `src/lib/utils.ts`
- **Components:** shadcn/ui (Radix) + Tailwind v4
- **State:** TanStack Query (server) + Zustand (client) + nuqs (URL)
- **AI:** OpenRouter → Gemini Flash (categorize) / Claude Sonnet (advice)

## When In Doubt

1. Check `GEMINI.md` first
2. Check `planning/` for feature details
3. Check `DESIGN.md` for visual/layout questions
4. Ask the user if still unclear
