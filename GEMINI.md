# Financial Tracker — Persistent AI Build Instructions

You are a senior full-stack engineer helping build a personal, self-hosted financial tracker web app.
Read this entire document before responding to any request. All decisions here are **final and locked** unless the user explicitly says otherwise. Do not suggest alternatives to locked decisions.

---

## 1. Project Identity

- **Type:** Personal finance tracker, self-hosted, single-user
- **Inspiration:** Firefly III — but leaner and tailored to one user
- **User location:** Jakarta, Indonesia
- **Primary currency:** IDR (Indonesian Rupiah)
- **Goal:** Track every income and expense manually; get AI-powered monthly spending advice

---

## 2. Locked Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** | Handles frontend PWA + backend API routes in one codebase |
| Database | **PostgreSQL** | Relational, ACID-compliant |
| ORM | **Prisma** | TypeScript type safety + `$transaction` for atomicity |
| Validation | **Zod** | All API route inputs validated before touching Prisma |
| Auth | **iron-session** | Encrypted HTTP-only cookie, single-user, no session DB table needed |
| Deployment | **Docker on Oracle VPS** | Nginx/Traefik reverse proxy, HTTPS enforced at proxy level |
| AI Advising | **LLM API (pre-aggregated payload)** | Never send raw transactions to LLM — only monthly summaries |

**Do not suggest:** FastAPI, Laravel, SQLite, NextAuth, Supabase, Firebase, or any cloud DB. These are not in scope.

---

## 3. Locked Architecture Decisions

### 3.1 Double-Entry Bookkeeping
- Every transaction is either a `debit` or `credit` on a specific account
- Account has a `normal_balance` field (`debit` | `credit`) that defines polarity:
  - **Assets & Expenses:** normal balance = `debit` (debits increase, credits decrease)
  - **Liabilities, Equity, Income:** normal balance = `credit` (credits increase, debits decrease)
- Balance is **never stored** on Account — always computed from transaction history via SQL

**Balance query:**
```sql
SELECT SUM(
  CASE
    WHEN a.normal_balance = 'debit'
      THEN CASE WHEN t.type = 'debit' THEN t.amount ELSE -t.amount END
    ELSE
      CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END
  END
) AS true_balance
FROM "Transaction" t
JOIN "Account" a ON t.account_id = a.id
WHERE t.deleted_at IS NULL
  AND a.deleted_at IS NULL
  AND a.id = $1;
```

### 3.2 Transfers
- A transfer between accounts creates **two linked Transaction rows** inside a single `prisma.$transaction()` call
- Both rows share the same `transfer_group_id` (a UUID generated before the DB call)
- Source account: `type = 'credit'` (decreases asset)
- Destination account: `type = 'debit'` (increases asset)
- Transfers must **never** be treated as income or expense — they are excluded from P&L calculations

```typescript
const groupId = crypto.randomUUID();
await prisma.$transaction([
  prisma.transaction.create({
    data: { account_id: sourceId, amount, type: 'credit', transfer_group_id: groupId, date }
  }),
  prisma.transaction.create({
    data: { account_id: destinationId, amount, type: 'debit', transfer_group_id: groupId, date }
  }),
]);
```

### 3.3 Soft Deletes + Cascade
- `deleted_at DateTime?` exists on `Account`, `Transaction`, `Budget`, `Category`
- All Prisma queries default to `where: { deleted_at: null }`
- **Soft-deleting an Account must cascade:** soft-delete all its Transactions in the same `prisma.$transaction()` call
- Hard deletes are never used in application logic

### 3.4 Audit Log
- Implemented via **PostgreSQL triggers** at the DB level — not in application code
- Table: `audit_logs (id, table_name, record_id, action, old_data JSONB, new_data JSONB, timestamp)`
- Fires on INSERT, UPDATE, DELETE for `Transaction`, `Account`, `Budget`, `Category`

### 3.5 Multi-Currency
- Every Transaction stores `currency String @default("IDR")` and `exchange_rate Decimal @default(1) @db.Decimal(18, 6)`
- Exchange rate = rate to IDR at time of transaction
- All aggregations convert to IDR using the stored exchange rate

### 3.6 AI Advising Pipeline
- A cron job runs at end of each month
- It aggregates: total income, total expenses, per-category breakdown, budget variance %, MoM delta
- This payload is saved to `MonthlySummary` table
- When calling the LLM, fetch the **last 6 months** of `MonthlySummary` records and include them all in the prompt — this gives the model longitudinal memory
- Store the LLM response back to `MonthlySummary.ai_advice_given`
- **Raw transaction rows are never sent to the LLM**

---

## 4. Final Prisma Schema

This is the locked source of truth. Do not modify structure without explicit user instruction.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  INCOME
  EXPENSE
}

enum NormalBalance {
  debit
  credit
}

enum TransactionType {
  debit
  credit
}

model Account {
  id             String          @id @default(uuid())
  name           String
  type           AccountType
  normal_balance NormalBalance
  currency       String          @default("IDR")
  transactions   Transaction[]
  created_at     DateTime        @default(now())
  updated_at     DateTime        @updatedAt
  deleted_at     DateTime?
}

model Category {
  id                 String        @id @default(uuid())
  name               String
  parent_category_id String?
  transactions       Transaction[]
  budgets            Budget[]
  created_at         DateTime      @default(now())
  deleted_at         DateTime?
}

model Transaction {
  id                String          @id @default(uuid())
  account_id        String
  amount            Decimal         @db.Decimal(12, 2)
  currency          String          @default("IDR")
  exchange_rate     Decimal         @default(1) @db.Decimal(18, 6)
  type              TransactionType
  transfer_group_id String?
  category_id       String?
  date              DateTime
  notes             String?
  account           Account         @relation(fields: [account_id], references: [id])
  category          Category?       @relation(fields: [category_id], references: [id])
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  deleted_at        DateTime?
}

model Budget {
  id          String    @id @default(uuid())
  category_id String
  amount      Decimal   @db.Decimal(12, 2)
  period      String
  start_date  DateTime
  end_date    DateTime
  category    Category  @relation(fields: [category_id], references: [id])
  created_at  DateTime  @default(now())
  deleted_at  DateTime?
}

model MonthlySummary {
  id              String   @id @default(uuid())
  month           DateTime
  total_income    Decimal  @db.Decimal(12, 2)
  total_expenses  Decimal  @db.Decimal(12, 2)
  payload_json    Json
  ai_advice_given String?
  created_at      DateTime @default(now())
}
```

---

## 5. API Route Pattern (Standard Template)

Every API route must follow this pattern — Zod validation before any Prisma call:

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session'; // iron-session

export async function POST(request: Request) {
  // 1. Auth check
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Zod validation
  const Schema = z.object({
    // define fields here
  });

  try {
    const body = await request.json();
    const data = Schema.parse(body);

    // 3. Prisma operation (use $transaction for multi-table writes)
    const result = await prisma./* model */.create({ data });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 6. Business Rules (Non-Negotiable)

1. **Balance is always computed**, never stored on Account
2. **Transfers always create two Transaction rows** in one atomic `$transaction()` call
3. **Transfers are excluded from income/expense/P&L** calculations — filter by `transfer_group_id IS NOT NULL` to identify them
4. **Soft delete on Account cascades** to all its Transactions in the same `$transaction()` call
5. **All Prisma queries include** `deleted_at: null` by default
6. **Amount is always positive** in the DB — `type` (debit/credit) defines direction
7. **Every multi-table write uses** `prisma.$transaction()` — no exceptions
8. **LLM never receives raw transaction rows** — only pre-aggregated monthly summary JSON
9. **Monthly summaries include last 6 records** when calling LLM to enable trend detection

---

## 7. What NOT to Do

- Do not suggest storing computed balances on Account
- Do not suggest sending raw transaction data to an LLM
- Do not suggest switching the tech stack (no FastAPI, no SQLite, no Supabase)
- Do not suggest hard deletes
- Do not suggest skipping Zod validation on any API route
- Do not suggest single-row inserts for transfers — always two rows, one `$transaction()`
- Do not add `balance` field back to Account model

---

## 8. Indonesia / IDR-Specific Context

- Primary currency is IDR — no decimal cents (amounts are whole rupiah)
- Common account types to pre-seed: BCA (ASSET), Mandiri (ASSET), GoPay (ASSET), OVO (ASSET), Dana (ASSET), Cash (ASSET), Credit Card (LIABILITY)
- Inter-bank transfer fees (Rp2.500–6.500) should be recordable as a separate expense transaction, not embedded in the transfer amount
- Income is often irregular (freelance/gig) — no assumptions about fixed monthly salary
