# Financial Tracker — AI Build Instructions

You are a senior full-stack engineer building a personal, self-hosted financial tracker.
Read this entire document before writing any code. All decisions here are **final and locked**.

---

## 1. Project Identity

- **Type:** Personal finance tracker, self-hosted, single-user
- **User:** Pradipta, Jakarta, Indonesia (Asia/Jakarta timezone, UTC+7)
- **Primary currency:** IDR (Indonesian Rupiah) — no decimal cents
- **Goal:** Track income/expense manually, AI categorization, email-assisted import, monthly AI advice

---

## 2. Tech Stack (Locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| CSS | Tailwind CSS v4 |
| Components | shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Forms | React Hook Form + @hookform/resolvers/zod |
| Icons | Lucide React |
| Data Fetching | TanStack Query v5 (React Query) |
| Client State | Zustand (with persist middleware) |
| URL State | nuqs (Next.js search params) |
| Tables | TanStack Table v8 |
| Date Picker | react-day-picker |
| Toasts | Sonner |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Validation | Zod v4 |
| Auth | iron-session v8 (encrypted HTTP-only cookie) |
| Password | argon2 |
| Decimal | decimal.js |
| LLM Provider | OpenRouter API |
| Categorizer Model | google/gemini-2.0-flash-001 |
| Advice Model | anthropic/claude-sonnet-4 |
| PWA | Serwist |
| Offline Queue | idb (IndexedDB wrapper) |
| Testing | Vitest + Playwright + @axe-core/playwright |
| Deployment | Docker + Docker Compose + Traefik on Oracle VPS |

**Never suggest:** FastAPI, Laravel, SQLite, NextAuth, Supabase, Firebase, MUI, Ant Design.

---

## 3. Environment Variables

Create `.env` from this template:

```env
# Database
DATABASE_URL="postgresql://fitracker:***@localhost:5432/fitracker"

# Auth
IRON_SESSION_SECRET="min-32-char-random-string-goes-here"
AUTH_PASSWORD_HASH="argon2-hash-of-your-password"

# AI (OpenRouter)
OPENROUTER_API_KEY="sk-or-..."
AI_CATEGORIZER_MODEL="google/gemini-2.0-flash-001"
AI_ADVICE_MODEL="anthropic/claude-sonnet-4"
AI_MONTHLY_BUDGET_USD="5.00"
AI_ENABLED="true"

# App
APP_URL="http://localhost:3000"
NODE_ENV="development"

# Gmail (Phase 2, optional)
GMAIL_CLIENT_ID=""
GMAIL_CLIENT_SECRET=""
GMAIL_ENCRYPTION_KEY=""
```

---

## 4. Target Prisma Schema

This is the **complete target schema** with 3 approved additions beyond the original locked schema:
1. `CategoryType` enum + `type` field on Category
2. `Setting` model for user preferences
3. `RecurringTransaction` model

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

enum CategoryType {
  INCOME
  EXPENSE
  TRANSFER_FEE
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
  type               CategoryType  @default(EXPENSE)
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

  @@index([account_id])
  @@index([category_id])
  @@index([date])
  @@index([transfer_group_id])
  @@index([deleted_at])
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

model Setting {
  id         String   @id @default(uuid())
  key        String   @unique
  value      Json
  updated_at DateTime @updatedAt
}

model RecurringTransaction {
  id             String          @id @default(uuid())
  name           String
  account_id     String
  amount         Decimal         @db.Decimal(12, 2)
  currency       String          @default("IDR")
  type           TransactionType
  category_id    String?
  notes          String?
  frequency      String          // "monthly", "weekly", "yearly"
  day_of_month   Int?
  last_generated DateTime?
  next_due       DateTime
  active         Boolean         @default(true)
  account        Account         @relation(fields: [account_id], references: [id])
  category       Category?       @relation(fields: [category_id], references: [id])
  created_at     DateTime        @default(now())
  updated_at     DateTime        @updatedAt
  deleted_at     DateTime?
}
```

**IMPORTANT:** Also add `Account` reverse relation for `RecurringTransaction` in the Account model:
```prisma
model Account {
  // ... existing fields ...
  recurringTransactions RecurringTransaction[]
}
```

---

## 5. Complete Seed Data

`prisma/seed.ts` must create all of these:

### Accounts

| Name | Type | Normal Balance |
|---|---|---|
| BCA | ASSET | debit |
| Mandiri | ASSET | debit |
| GoPay | ASSET | debit |
| OVO | ASSET | debit |
| Dana | ASSET | debit |
| Cash | ASSET | debit |
| Credit Card | LIABILITY | credit |

### Categories

**INCOME type:**
- Salary, Freelance, Bonus, Gift, Other Income

**EXPENSE type:**
- Food & Drinks, Groceries, Transport, Rent, Utilities, Internet & Phone, Health, Shopping, Entertainment, Subscription, Family, Education, Travel, Other Expense

**TRANSFER_FEE type:**
- Bank Fees, Transfer Fees

### Default Settings

```json
[
  { "key": "defaultCurrency", "value": "\"IDR\"" },
  { "key": "dateFormat", "value": "\"DD/MM/YYYY\"" },
  { "key": "theme", "value": "\"system\"" },
  { "key": "firstDayOfWeek", "value": "\"monday\"" },
  { "key": "aiCategorizerEnabled", "value": "true" },
  { "key": "aiMonthlyAdviceEnabled", "value": "true" },
  { "key": "recurringAutoPrompt", "value": "true" },
  { "key": "onboarding_completed", "value": "{\"completed\": false}" }
]
```

---

## 6. Accounting Rules (Non-Negotiable)

### Normal Balance

| Account Type | Normal Balance | Debit Effect | Credit Effect |
|---|---|---|---|
| ASSET | debit | increase | decrease |
| EXPENSE | debit | increase | decrease |
| LIABILITY | credit | decrease | increase |
| EQUITY | credit | decrease | increase |
| INCOME | credit | decrease | increase |

### Income vs Expense Classification

Income and expense are classified by **Category type**, not transaction type:
- `CategoryType.INCOME` → income (transaction type = `debit` on ASSET account)
- `CategoryType.EXPENSE` → expense (transaction type = `credit` on ASSET account)
- `CategoryType.TRANSFER_FEE` → fee expense

### Balance Computation

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

### Transfers

- Creates TWO rows in one `prisma.$transaction()` call
- Same `transfer_group_id` (UUID generated before DB call)
- Source: `type = 'credit'` (decreases asset)
- Destination: `type = 'debit'` (increases asset)
- Excluded from P&L: filter `transfer_group_id IS NOT NULL`
- Fee is separate expense transaction, never embedded

### Soft Deletes

- `deleted_at DateTime?` on Account, Transaction, Budget, Category, RecurringTransaction
- All queries default to `where: { deleted_at: null }`
- Account delete cascades to all its Transactions in same `$transaction()`
- Never hard-delete

### Amount Rules

- Always positive in DB — `type` defines direction
- IDR has no cents in UI display
- Foreign currency: `amount * exchange_rate` for IDR conversion

---

## 7. File Manifest

Create these files in this order:

### Phase 1: Foundation

```
.env.example
prisma/schema.prisma                          ← update to target schema
prisma/seed.ts                                ← update with full seed data
prisma/migrations/XXXXXX_add_category_type_setting_recurring/migration.sql
src/lib/prisma.ts                             ← exists, keep
src/lib/session.ts                            ← exists, keep
src/lib/balance.ts                            ← exists, keep
src/lib/transfer.ts                           ← exists, keep
src/lib/auth.ts                               ← NEW: password verify + middleware
src/lib/soft-delete.ts                        ← NEW: Prisma extension for auto deleted_at filter
src/lib/utils.ts                              ← NEW: cn(), formatIDR(), formatDate()
src/lib/validators.ts                         ← NEW: shared Zod schemas
src/types/index.ts                            ← NEW: shared TypeScript types
src/types/api.ts                              ← NEW: API response types
```

### Phase 2: API Routes

```
src/app/api/auth/login/route.ts               ← exists, update
src/app/api/auth/logout/route.ts              ← exists, keep
src/app/api/auth/me/route.ts                  ← NEW
src/app/api/accounts/route.ts                 ← exists, update
src/app/api/accounts/[id]/route.ts            ← NEW
src/app/api/accounts/[id]/balance/route.ts    ← NEW
src/app/api/categories/route.ts               ← NEW
src/app/api/categories/[id]/route.ts          ← NEW
src/app/api/transactions/route.ts             ← exists, update
src/app/api/transactions/[id]/route.ts        ← NEW
src/app/api/transactions/transfer/route.ts    ← NEW
src/app/api/transactions/uncategorized/route.ts ← NEW
src/app/api/budgets/route.ts                  ← NEW
src/app/api/budgets/[id]/route.ts             ← NEW
src/app/api/budgets/progress/route.ts         ← NEW
src/app/api/recurring/route.ts                ← NEW
src/app/api/recurring/[id]/route.ts           ← NEW
src/app/api/recurring/due/route.ts            ← NEW
src/app/api/recurring/[id]/accept/route.ts    ← NEW
src/app/api/reports/monthly/route.ts          ← NEW
src/app/api/reports/cashflow/route.ts         ← NEW
src/app/api/reports/categories/route.ts       ← NEW
src/app/api/reports/budgets/route.ts          ← NEW
src/app/api/reports/accounts/route.ts         ← NEW
src/app/api/reports/monthly-summary/run/route.ts ← NEW
src/app/api/reports/monthly-summary/advise/route.ts ← NEW
src/app/api/ai/categorize/route.ts            ← NEW
src/app/api/ai/categorize/batch/route.ts      ← NEW
src/app/api/ai/categorize/[id]/accept/route.ts ← NEW
src/app/api/email/parse/route.ts              ← NEW
src/app/api/email/accept/route.ts             ← NEW
src/app/api/settings/route.ts                 ← NEW
src/app/api/settings/export/csv/route.ts      ← NEW
src/app/api/settings/export/json/route.ts     ← NEW
src/app/api/health/route.ts                   ← NEW
src/app/api/onboarding/status/route.ts        ← NEW
src/app/api/onboarding/complete/route.ts      ← NEW
```

### Phase 3: Service Layer

```
src/lib/services/accounts.ts                  ← NEW
src/lib/services/categories.ts                ← NEW
src/lib/services/transactions.ts              ← NEW
src/lib/services/transfers.ts                 ← update from transfer.ts
src/lib/services/budgets.ts                   ← NEW
src/lib/services/recurring.ts                 ← NEW
src/lib/services/reports.ts                   ← NEW
src/lib/services/monthly-summary.ts           ← NEW
src/lib/services/settings.ts                  ← NEW
src/lib/services/onboarding.ts                ← NEW
src/lib/ai/client.ts                          ← NEW: OpenRouter fetch wrapper
src/lib/ai/categorize.ts                      ← NEW: categorizer logic + prompt
src/lib/ai/monthly-advice.ts                  ← NEW: advice logic + prompt
src/lib/ai/rate-limit.ts                      ← NEW: in-memory rate limiter
src/lib/email/parser.ts                       ← NEW: email text parser
src/lib/email/dedup.ts                        ← NEW: duplicate detection
src/lib/export/csv.ts                         ← NEW: CSV export
src/lib/export/json.ts                        ← NEW: JSON backup export
```

### Phase 4: UI Components

```
src/components/ui/                            ← shadcn/ui components (auto-generated)
src/components/providers/query-provider.tsx   ← NEW
src/components/providers/theme-provider.tsx   ← NEW
src/components/layout/app-shell.tsx           ← NEW: responsive wrapper
src/components/layout/sidebar-nav.tsx         ← NEW: desktop sidebar
src/components/layout/bottom-nav.tsx          ← NEW: mobile bottom nav
src/components/layout/header.tsx              ← NEW: top header
src/components/transaction/transaction-form.tsx ← NEW
src/components/transaction/transaction-card.tsx ← NEW
src/components/transaction/transaction-list.tsx ← NEW
src/components/transaction/transaction-filters.tsx ← NEW
src/components/transaction/amount-input.tsx   ← NEW
src/components/transaction/category-picker.tsx ← NEW
src/components/transaction/account-picker.tsx ← NEW
src/components/transaction/floating-add-button.tsx ← NEW
src/components/transaction/transfer-form.tsx  ← NEW
src/components/transaction/template-chips.tsx ← NEW
src/components/report/stat-card.tsx           ← NEW
src/components/report/category-chart.tsx      ← NEW
src/components/report/trend-chart.tsx         ← NEW
src/components/report/budget-bar.tsx          ← NEW
src/components/report/monthly-overview.tsx    ← NEW
src/components/ai/confidence-badge.tsx        ← NEW
src/components/ai/suggestion-card.tsx         ← NEW
src/components/email/import-card.tsx          ← NEW
src/components/email/import-review-list.tsx   ← NEW
src/components/shared/month-selector.tsx      ← NEW
src/components/shared/empty-state.tsx         ← NEW
src/components/shared/loading-skeleton.tsx    ← NEW
src/components/shared/error-boundary.tsx      ← NEW
src/components/shared/offline-indicator.tsx   ← NEW
src/components/shared/install-prompt.tsx      ← NEW
src/components/shared/confirm-dialog.tsx      ← NEW
src/components/onboarding/onboarding-flow.tsx ← NEW
```

### Phase 5: Pages

```
src/app/layout.tsx                            ← update with providers
src/app/page.tsx                              ← redirect to /dashboard
src/app/globals.css                           ← update with shadcn theme vars
src/app/(auth)/login/page.tsx                 ← exists, update
src/app/(auth)/layout.tsx                     ← exists, keep
src/app/(app)/layout.tsx                      ← update with app shell
src/app/(app)/dashboard/page.tsx              ← exists, rebuild
src/app/(app)/transactions/page.tsx           ← exists, rebuild
src/app/(app)/transactions/[id]/page.tsx      ← NEW
src/app/(app)/accounts/page.tsx               ← exists, rebuild
src/app/(app)/accounts/[id]/page.tsx          ← NEW
src/app/(app)/categories/page.tsx             ← NEW
src/app/(app)/budgets/page.tsx                ← NEW
src/app/(app)/email-imports/page.tsx          ← NEW
src/app/(app)/recurring/page.tsx              ← NEW
src/app/(app)/reports/page.tsx                ← NEW
src/app/(app)/reports/[type]/page.tsx         ← NEW
src/app/(app)/settings/page.tsx               ← NEW
src/app/(app)/settings/[section]/page.tsx     ← NEW
```

### Phase 6: Hooks + Stores

```
src/hooks/use-accounts.ts                     ← NEW
src/hooks/use-transactions.ts                 ← NEW
src/hooks/use-categories.ts                   ← NEW
src/hooks/use-budgets.ts                      ← NEW
src/hooks/use-reports.ts                      ← NEW
src/hooks/use-recurring.ts                    ← NEW
src/hooks/use-settings.ts                     ← NEW
src/hooks/use-transaction-filters.ts          ← NEW (nuqs)
src/stores/ui-store.ts                        ← NEW (Zustand)
src/stores/recent-store.ts                    ← NEW (Zustand + persist)
src/stores/template-store.ts                  ← NEW (Zustand + persist)
```

### Phase 7: Config + PWA

```
public/manifest.webmanifest                   ← NEW
public/icons/icon-192.png                     ← NEW
public/icons/icon-512.png                     ← NEW
src/app/sw.ts                                 ← NEW (Serwist service worker)
src/lib/offline-queue.ts                      ← NEW
next.config.ts                                ← update for Serwist
```

### Phase 8: Deployment

```
Dockerfile                                    ← NEW
docker-compose.yml                            ← NEW
docker-compose.prod.yml                       ← NEW
scripts/backup.sh                             ← NEW
scripts/cron-monthly-summary.sh               ← NEW
traefik/traefik.yml                           ← NEW
```

### Phase 9: Testing

```
vitest.config.ts                              ← NEW
playwright.config.ts                          ← NEW
tests/unit/balance.test.ts                    ← NEW
tests/unit/transfer.test.ts                   ← NEW
tests/unit/parser.test.ts                     ← NEW
tests/unit/categorize.test.ts                 ← NEW
tests/integration/transactions.test.ts        ← NEW
tests/e2e/mobile-add.spec.ts                  ← NEW
tests/accessibility.spec.ts                   ← NEW
```

---

## 8. TypeScript Types

`src/types/index.ts`:

```typescript
export interface AccountWithBalance {
  id: string;
  name: string;
  type: AccountType;
  normal_balance: NormalBalance;
  currency: string;
  balance: number; // computed, never stored
}

export interface CategoryWithChildren {
  id: string;
  name: string;
  type: CategoryType;
  parent_category_id: string | null;
  children: CategoryWithChildren[];
}

export interface TransactionWithRelations {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  type: TransactionType;
  transfer_group_id: string | null;
  category_id: string | null;
  date: string;
  notes: string | null;
  account: { id: string; name: string; type: AccountType };
  category: { id: string; name: string; type: CategoryType } | null;
  is_transfer: boolean;
}

export interface BudgetWithProgress {
  id: string;
  category_id: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
  category: { id: string; name: string };
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'near' | 'over';
}

export interface MonthlySummaryPayload {
  month: string;
  currency: string;
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  savingsRate: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentageOfExpenses: number;
    monthOverMonthDelta: number;
  }[];
  budgetVariance: {
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    varianceAmount: number;
    variancePercent: number;
  }[];
  accountBalances: {
    accountId: string;
    accountName: string;
    type: string;
    balanceIdr: number;
  }[];
  trends: {
    incomeMoMPercent: number;
    expenseMoMPercent: number;
    netCashflowMoMPercent: number;
  };
}

export interface AISuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
  reason: string;
}

export interface AIAdvice {
  summary: string;
  wins: string[];
  risks: string[];
  recommendations: string[];
  nextMonthFocus: string[];
}

export interface EmailExtractResult {
  providerMessageId?: string;
  sender: string;
  subject: string;
  receivedAt: string;
  merchant: string | null;
  amount: number | null;
  currency: string;
  transactionDate: string | null;
  accountHint: string | null;
  paymentMethodHint: string | null;
  referenceNumber: string | null;
  suggestedType: 'expense' | 'income' | 'transfer' | 'unknown';
  suggestedCategoryName: string | null;
  confidence: number;
  rawSnippet: string;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income';
  account_id: string;
  category_id: string;
  amount: number;
  currency: string;
  notes: string;
  usageCount: number;
  lastUsed: string;
}
```

`src/types/api.ts`:

```typescript
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: { page: number; pageSize: number; total: number; hasMore: boolean };
};
```

---

## 9. Shared Zod Validators

`src/lib/validators.ts`:

```typescript
import { z } from 'zod';

export const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('IDR'),
  exchange_rate: z.coerce.number().positive().default(1),
  type: z.enum(['debit', 'credit']),
  category_id: z.string().uuid().optional().nullable(),
  date: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const createTransferSchema = z.object({
  source_account_id: z.string().uuid(),
  destination_account_id: z.string().uuid(),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('IDR'),
  exchange_rate: z.coerce.number().positive().default(1),
  date: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
  fee: z.object({
    amount: z.coerce.number().positive(),
    account_id: z.string().uuid(),
    category_id: z.string().uuid(),
    notes: z.string().max(500).optional().nullable(),
  }).optional(),
}).refine(
  data => data.source_account_id !== data.destination_account_id,
  { message: 'Source and destination accounts must be different' }
);

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']),
  normal_balance: z.enum(['debit', 'credit']),
  currency: z.string().default('IDR'),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER_FEE']).default('EXPENSE'),
  parent_category_id: z.string().uuid().optional().nullable(),
});

export const createBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  period: z.string().default('monthly'),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});

export const createRecurringSchema = z.object({
  name: z.string().min(1).max(100),
  account_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().default('IDR'),
  type: z.enum(['debit', 'credit']),
  category_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  day_of_month: z.number().int().min(1).max(28).optional().nullable(),
});

export const emailParseSchema = z.object({
  provider_message_id: z.string().optional(),
  sender: z.string(),
  subject: z.string(),
  received_at: z.coerce.date(),
  snippet: z.string().max(5000),
});

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const reportFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});
```

---

## 10. Auth Implementation

`src/lib/auth.ts`:

```typescript
import { verify } from 'argon2';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export async function requireAuth(): Promise<{ userId: string }> {
  const session = await getSession();
  if (!session.userId) {
    redirect('/login');
  }
  return { userId: session.userId };
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) throw new Error('AUTH_PASSWORD_HASH not set');
  return verify(hash, password);
}

export async function isAuthed(): Promise<boolean> {
  const session = await getSession();
  return !!session.userId;
}
```

Use `requireAuth()` at the top of every protected API route and page.

---

## 11. Soft-Delete Prisma Extension

`src/lib/soft-delete.ts`:

```typescript
import { Prisma } from '@prisma/client';

// Middleware that auto-injects deleted_at: null on reads
export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete',
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
    },
  },
});
```

Apply in `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { softDeleteExtension } from '@/lib/soft-delete';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma = globalForPrisma.prisma ??
  new PrismaClient().$extends(softDeleteExtension);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

---

## 12. Utility Functions

`src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIDRShort(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`;
  return amount.toString();
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function getMonthRange(month: string): { start: Date; end: Date } {
  const start = new Date(`${month}-01T00:00:00+07:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}
```

---

## 13. AI Prompt Templates (Copy-Paste Ready)

### Categorizer Prompt

```typescript
// src/lib/ai/categorize.ts

function buildCategorizePrompt(
  transaction: { amount: number; currency: string; date: string; notes?: string; accountName: string; accountType: string; merchantHint?: string },
  categories: { id: string; name: string; type: string }[]
): string {
  const categoryList = categories
    .map(c => `${c.id} | ${c.name} (${c.type})`)
    .join('\n');

  return `You are a transaction categorizer for a personal finance app.
User is in Jakarta, Indonesia. Primary currency is IDR.

Assign exactly ONE category from the list below.

Transaction:
- Amount: ${transaction.amount} ${transaction.currency}
- Date: ${transaction.date}
- Account: ${transaction.accountName} (${transaction.accountType})
- Notes: ${transaction.notes || 'none'}
- Merchant: ${transaction.merchantHint || 'unknown'}

Available categories (id | name | type):
${categoryList}

Rules:
- Pick ONLY from the provided list
- If unsure, return confidence below 0.5
- Return JSON only

Respond:
{"categoryId":"uuid","categoryName":"name","confidence":0.0-1.0,"reason":"one sentence"}`;
}
```

### Monthly Advice Prompt

```typescript
// src/lib/ai/monthly-advice.ts

function buildAdvicePrompt(summaries: MonthlySummaryPayload[]): string {
  const summariesText = summaries.map(s => `
## ${s.month}
- Income: ${formatIDR(s.totalIncome)}
- Expenses: ${formatIDR(s.totalExpenses)}
- Net: ${formatIDR(s.netCashflow)}
- Savings Rate: ${s.savingsRate.toFixed(1)}%
- Top Categories: ${s.categoryBreakdown.slice(0, 5).map(c => `${c.categoryName}: ${formatIDR(c.amount)}`).join(', ')}
- Budget Overruns: ${s.budgetVariance.filter(b => b.variancePercent > 0).map(b => `${b.categoryName}: +${b.variancePercent.toFixed(0)}%`).join(', ') || 'none'}
`).join('\n');

  return `You are a personal finance advisor for a user in Jakarta, Indonesia.
Primary currency is IDR. Income is often irregular (freelance/gig).

Analyze the last ${summaries.length} months:
${summariesText}

Respond in JSON:
{"summary":"2-3 sentence overview","wins":["positive 1","positive 2"],"risks":["concern 1","concern 2"],"recommendations":["action 1","action 2","action 3"],"nextMonthFocus":["category 1","category 2"]}

Rules:
- Be specific with IDR amounts
- Reference actual numbers
- Keep advice practical
- Consider Indonesian context (e-wallets, irregular income)
- Never fabricate data`;
}
```

### AI Client

```typescript
// src/lib/ai/client.ts

export async function callLLM(config: {
  model: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Financial Tracker',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: config.prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## 14. Route Protection Map

| Route Pattern | Auth Required | Layout |
|---|---|---|
| `/login` | ❌ Public | `(auth)` |
| `/api/auth/login` | ❌ Public | — |
| `/api/health` | ❌ Public | — |
| `/dashboard` | ✅ Required | `(app)` |
| `/transactions/**` | ✅ Required | `(app)` |
| `/accounts/**` | ✅ Required | `(app)` |
| `/categories/**` | ✅ Required | `(app)` |
| `/budgets/**` | ✅ Required | `(app)` |
| `/recurring/**` | ✅ Required | `(app)` |
| `/email-imports/**` | ✅ Required | `(app)` |
| `/reports/**` | ✅ Required | `(app)` |
| `/settings/**` | ✅ Required | `(app)` |
| `/api/**` (except auth/health) | ✅ Required | — |

---

## 15. ASCII Wireframes

### Mobile: Add Transaction

```
┌──────────────────────────┐
│ ← Add Expense         ⚙️ │
├──────────────────────────┤
│ Quick:                   │
│ [☕ 25K] [🚗 55K] [🍜 50K]│
├──────────────────────────┤
│                          │
│      Rp           0      │
│                          │
├──────────────────────────┤
│ Account:  [BCA       ▼] │
│ Category: [Food      ▼] │
│ Date:     [Today     ▼] │
│ Notes:    [           ] │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │      Save            │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Mobile: Dashboard

```
┌──────────────────────────┐
│ Financial Tracker    ⚙️  │
├──────────────────────────┤
│ April 2026          ◀ ▶ │
├──────────────────────────┤
│ ┌────────┐ ┌────────┐   │
│ │Income  │ │Expense │   │
│ │15.0jt  │ │7.5jt   │   │
│ └────────┘ └────────┘   │
│ ┌────────────────────┐   │
│ │Net: Rp7.500.000    │   │
│ │Savings: 50%        │   │
│ └────────────────────┘   │
├──────────────────────────┤
│ Top Spending             │
│ Food & Drinks  ████ 2.5jt│
│ Transport      ██   1.2jt│
│ Rent           █████ 3jt │
├──────────────────────────┤
│ Recent Transactions      │
│ Gojek  🚗  -55.000       │
│ Kopi   ☕  -25.000       │
│ Salary 💰  +15.000.000   │
├──────────────────────────┤
│                          │
│  [🏠] [📊] [+ ] [📈] [⋯]│
└──────────────────────────┘
```

### Desktop: Dashboard

```
┌─────────┬─────────────────────────────────────┐
│ Logo    │  Dashboard · April 2026       [Add] │
│         ├─────────────────────────────────────┤
│ Dash    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│ Trans   │  │Income│ │Expns │ │ Net  │ │Save│ │
│ Accts   │  │ 15jt │ │ 7.5jt│ │ 7.5jt│ │ 50%│ │
│ Cats    │  └──────┘ └──────┘ └──────┘ └────┘ │
│ Budget  │                                     │
│ Recur   │  ┌─────────────────┐ ┌────────────┐ │
│ Email   │  │ Spending Chart  │ │ Budget     │ │
│ Report  │  │ [Pie/Bar]       │ │ Food ███ 80%│ │
│ Setting │  │                 │ │ Rent ███ 100│ │
│         │  └─────────────────┘ └────────────┘ │
│         │                                     │
│         │  ┌─────────────────────────────────┐ │
│         │  │ Recent Transactions  [View All] │ │
│         │  │ Date | Account | Cat | Amount   │ │
│         │  │ 18/04| GoPay   | Trn | -55.000  │ │
│         │  │ 17/04| BCA     | Food| -120.000 │ │
│         │  └─────────────────────────────────┘ │
│         │                                     │
│         │  ┌─────────────────────────────────┐ │
│         │  │ 🤖 AI Advice: "Expenses down   │ │
│         │  │ 8% MoM. Watch Food spending."  │ │
│         │  └─────────────────────────────────┘ │
└─────────┴─────────────────────────────────────┘
```

---

## 16. API Route Pattern (Every Route Must Follow)

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  // 1. Auth check
  await requireAuth();

  // 2. Zod validation
  const Schema = z.object({ /* ... */ });

  try {
    const body = await request.json();
    const data = Schema.parse(body);

    // 3. Prisma operation
    const result = await prisma.model.create({ data });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 17. Pagination Pattern

- **Style:** Cursor-based (using `created_at` DESC)
- **Default page size:** 20 (mobile), 50 (desktop)
- **Max page size:** 100

```typescript
// GET /api/transactions?cursor=xxx&limit=20&account=uuid&category=uuid&from=2026-04-01&to=2026-04-30&q=keyword

const transactions = await prisma.transaction.findMany({
  where: {
    deleted_at: null,
    account_id: filters.accountId,
    category_id: filters.categoryId,
    date: { gte: filters.from, lte: filters.to },
    notes: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
  },
  include: { account: true, category: true },
  orderBy: { date: 'desc' },
  take: limit + 1, // fetch one extra to check hasMore
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,
});

const hasMore = transactions.length > limit;
if (hasMore) transactions.pop();
const nextCursor = hasMore ? transactions[transactions.length - 1].id : null;
```

---

## 18. Report Query Pattern

All report queries MUST:

1. Filter `t.deleted_at IS NULL`
2. Filter `a.deleted_at IS NULL`
3. Exclude transfers: `t.transfer_group_id IS NULL`
4. Convert to IDR: `t.amount * t.exchange_rate`
5. Classify by category type: `c.type = 'INCOME'` or `c.type = 'EXPENSE'`

```sql
-- Income total for period
SELECT COALESCE(SUM(t.amount * t.exchange_rate), 0) AS total
FROM "Transaction" t
JOIN "Account" a ON t.account_id = a.id
LEFT JOIN "Category" c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
  AND a.deleted_at IS NULL
  AND t.transfer_group_id IS NULL
  AND c.type = 'INCOME'
  AND t.date >= $1 AND t.date < $2;

-- Expense total for period
SELECT COALESCE(SUM(t.amount * t.exchange_rate), 0) AS total
FROM "Transaction" t
JOIN "Account" a ON t.account_id = a.id
LEFT JOIN "Category" c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
  AND a.deleted_at IS NULL
  AND t.transfer_group_id IS NULL
  AND c.type IN ('EXPENSE', 'TRANSFER_FEE')
  AND t.date >= $1 AND t.date < $2;
```

---

## 19. Cron Jobs

### Monthly Summary (runs last day of month at 23:00 WIB)

```bash
#!/bin/bash
# scripts/cron-monthly-summary.sh
curl -X POST http://localhost:3000/api/reports/monthly-summary/run \
  -H "Cookie: fitracker_session=..." \
  -H "Content-Type: application/json"
```

System cron in Docker:

```dockerfile
# Add to Dockerfile
RUN echo "0 16 28-31 * * [ \$(date -d tomorrow +\\%d) -eq 1 ] && /app/scripts/cron-monthly-summary.sh" | crontab -
```

---

## 20. Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fitracker
      POSTGRES_USER: ***
      POSTGRES_PASSWORD: ***
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://fitracker:***@db:5432/fitracker
    env_file: .env
    ports:
      - "3000:3000"
    depends_on:
      - db
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.fitracker.rule=Host(`finance.yourdomain.com`)"
      - "traefik.http.routers.fitracker.tls=true"

  traefik:
    image: traefik:v3
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik/certs:/certs

volumes:
  pgdata:
```

---

## 21. What NOT To Do

- Do NOT store balance on Account model
- Do NOT send raw transactions to LLM (summaries only for monthly advice)
- Do NOT hard-delete any record
- Do NOT skip Zod validation on any API route
- Do NOT create single-row transfers (always two rows, one $transaction)
- Do NOT use NextAuth, Supabase, Firebase, SQLite
- Do NOT suggest switching the tech stack
- Do NOT create balances that aren't computed from transaction history
- Do NOT auto-create transactions from email imports (user must confirm)
- Do NOT auto-apply AI category suggestions (user must confirm)

---

## 22. Build Order

1. `prisma/schema.prisma` → migrate → seed
2. `src/lib/` foundation files (prisma, session, auth, balance, transfer, utils, validators, soft-delete)
3. `src/types/` all type definitions
4. API routes in order: auth → accounts → categories → transactions → transfers → budgets → recurring → reports → AI → email → settings → health
5. Service layer files
6. Query provider + theme provider
7. shadcn/ui component installation
8. Layout + app shell
9. Dashboard page
10. Transaction pages + form
11. Account/Category/Budget management pages
12. Recurring transactions page
13. Email imports page
14. Reports pages
15. Settings page
16. AI categorizer UI
17. Onboarding flow
18. PWA setup (manifest, service worker)
19. Docker + deployment
20. Testing

Start building now. Read `planning/` folder for detailed specs on each feature.
