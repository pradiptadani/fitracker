# 04 — API Plan

## API Rules

Every API route must:

1. Check `iron-session` auth first.
2. Parse request body with Zod before Prisma.
3. Use `deleted_at: null` for normal reads.
4. Use `prisma.$transaction()` for multi-table writes.
5. Return structured JSON errors.
6. Never hard-delete app records.

## Route Map

### Auth

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Create session |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Current session user |

### Accounts

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/accounts` | List accounts with computed balances |
| POST | `/api/accounts` | Create account |
| GET | `/api/accounts/[id]` | Account detail |
| PATCH | `/api/accounts/[id]` | Update account |
| DELETE | `/api/accounts/[id]` | Soft-delete account and cascade transactions |
| GET | `/api/accounts/[id]/balance` | Computed account balance |

### Categories

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/categories` | List categories/tree |
| POST | `/api/categories` | Create category |
| PATCH | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Soft-delete category |

### Transactions

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/transactions` | List/filter/search transactions |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/[id]` | Transaction detail |
| PATCH | `/api/transactions/[id]` | Update transaction |
| DELETE | `/api/transactions/[id]` | Soft-delete transaction |
| POST | `/api/transactions/transfer` | Create transfer pair |
| GET | `/api/transactions/uncategorized` | List uncategorized transactions |

### Budgets

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create budget |
| PATCH | `/api/budgets/[id]` | Update budget |
| DELETE | `/api/budgets/[id]` | Soft-delete budget |
| GET | `/api/budgets/progress` | Budget actual vs planned |

### AI Categorization

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/ai/categorize` | Suggest category for one transaction |
| POST | `/api/ai/categorize/batch` | Suggest categories for many transactions |
| POST | `/api/ai/categorize/[transactionId]/accept` | Apply suggested category |

### Email Finance Fetcher

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/email/search-finance` | Fetch finance-related emails |
| POST | `/api/email/parse` | Parse one email into candidate transaction |
| POST | `/api/email/import-preview` | Build review list |
| POST | `/api/email/accept` | Convert accepted candidate to transaction |
| POST | `/api/email/ignore` | Ignore candidate if queue table exists |

### Reports

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/reports/monthly` | Monthly report |
| GET | `/api/reports/cashflow` | Income/expense/net trend |
| GET | `/api/reports/categories` | Category breakdown |
| GET | `/api/reports/budgets` | Budget variance |
| GET | `/api/reports/accounts` | Balance summary |
| POST | `/api/reports/monthly-summary/run` | Generate MonthlySummary |
| POST | `/api/reports/monthly-summary/advise` | Generate AI advice from last 6 summaries |

## Zod Schema Examples

### Create Transaction

```typescript
const CreateTransactionSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().default('IDR'),
  exchange_rate: z.coerce.number().positive().default(1),
  type: z.enum(['debit', 'credit']),
  category_id: z.string().uuid().optional().nullable(),
  date: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
});
```

### Create Transfer

```typescript
const CreateTransferSchema = z.object({
  source_account_id: z.string().uuid(),
  destination_account_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
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
```

### AI Categorize

```typescript
const CategorizeSchema = z.object({
  transaction_id: z.string().uuid(),
});
```

### Email Parse

```typescript
const EmailParseSchema = z.object({
  provider_message_id: z.string().optional(),
  sender: z.string(),
  subject: z.string(),
  received_at: z.coerce.date(),
  snippet: z.string().max(2000),
});
```

## Service Layer

Suggested service files:

- `src/lib/accounts.ts`
- `src/lib/categories.ts`
- `src/lib/transactions.ts`
- `src/lib/transfer.ts`
- `src/lib/balance.ts`
- `src/lib/reports.ts`
- `src/lib/ai/categorize.ts`
- `src/lib/ai/monthly-advice.ts`
- `src/lib/email/search.ts`
- `src/lib/email/parse.ts`

## Error Response Shape

```json
{
  "error": "Validation failed",
  "details": []
}
```

Common statuses:

- 200 success
- 201 created
- 400 validation error
- 401 unauthorized
- 404 not found
- 409 duplicate/conflict
- 500 server error
