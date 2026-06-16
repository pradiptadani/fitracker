# Financial Tracker — Claude Code Instructions

You are building a personal finance tracker (Next.js 16, TypeScript, PostgreSQL, Prisma).
Read GEMINI.md for the complete build specification. This file adds Claude-specific rules.

## Project Context

- **User:** Pradipta, Jakarta, Indonesia (UTC+7)
- **Stack:** Next.js 16 App Router + Prisma 6 + Zod v4 + iron-session + Tailwind v4 + shadcn/ui
- **Database:** PostgreSQL 16 on same machine
- **Deployment:** Docker on Oracle VPS with OpenResty reverse proxy (user manages proxy)
- **Currency:** IDR (no decimals)
- **Single user** — no multi-tenancy

## Key Files

- `GEMINI.md` — Complete build spec (schema, types, file manifest, prompts, wireframes)
- `planning/` — Detailed feature specs (9 docs)
- `prisma/schema.prisma` — Current schema (needs update to target schema in GEMINI.md)
- `src/lib/` — Core library files (prisma, session, balance, transfer)
- `src/app/` — Next.js App Router pages and API routes

## Rules

1. Always read `GEMINI.md` before starting any feature
2. Every API route: auth check → Zod validate → Prisma → respond
3. Every Prisma query: `where: { deleted_at: null }` (soft-delete)
4. Transfers: always 2 rows in `prisma.$transaction()`, never count as income/expense
5. Balance: always computed via SQL, never stored
6. AI calls: never send raw transactions — only monthly summaries
7. Amount: always positive in DB, `type` (debit/credit) defines direction
8. Category `type` field determines if transaction is income or expense
9. Use `cn()` from `src/lib/utils.ts` for className merging
10. Use `formatIDR()` for currency display, `formatDate()` for dates

## Build Order

Follow GEMINI.md section 22 (Build Order). Do not skip phases.

## Code Style

- Functional components with hooks
- Server Components by default, `'use client'` only when needed
- Named exports preferred
- Colocate types near usage, shared types in `src/types/`
- No `any` — use `unknown` + narrow
- Prefer `$queryRaw` for complex aggregations over Prisma client
- All async functions that touch DB should handle errors explicitly

## What Not To Touch

- Do not modify `src/lib/prisma.ts` singleton pattern
- Do not modify `src/lib/session.ts` iron-session config
- Do not add a `balance` field to Account model
- Do not install NextAuth, Supabase, or Firebase
- Do not suggest SQLite

## When Unsure

Check `planning/` folder for detailed specs. If still unclear, ask.
