# 03 — Data Model And Rules

## Locked Prisma Models

Use existing locked schema from `GEMINI.md` as source of truth:

- Account
- Category
- Transaction
- Budget
- MonthlySummary

Do not modify schema unless user explicitly approves.

## Accounting Rules

### Normal Balance

| Account Type | Normal Balance | Debit | Credit |
|---|---|---|---|
| ASSET | debit | increase | decrease |
| EXPENSE | debit | increase | decrease |
| LIABILITY | credit | decrease | increase |
| EQUITY | credit | decrease | increase |
| INCOME | credit | decrease | increase |

### Balance Computation

Balance is computed from active transactions only.

Rules:

- `Account.deleted_at IS NULL`
- `Transaction.deleted_at IS NULL`
- Never read `Account.balance`; field must not exist
- Use account `normal_balance` to determine sign

### Transaction Amount

- Always positive
- Direction comes from `type`
- IDR has no cent display in UI
- DB Decimal stays as schema locked

### Transfers

Transfer rows:

1. Source account row:
   - `type = 'credit'`
   - decreases source asset
   - same `transfer_group_id`

2. Destination account row:
   - `type = 'debit'`
   - increases destination asset
   - same `transfer_group_id`

Transfer report rule:

- Exclude rows where `transfer_group_id IS NOT NULL` from income, expense, budget, P&L, savings rate.

Transfer fee rule:

- Fee is separate expense transaction.
- Fee must not be embedded inside transfer amount.

## Soft Delete Rules

Soft-deleted records:

- stay in database
- hidden from app views
- excluded from balances/reports
- available for audit/history if needed

Account delete cascade:

- Soft-delete Account
- Soft-delete all related Transactions
- Run in same `prisma.$transaction()`

Category delete:

- Soft-delete Category
- Existing transactions can keep `category_id`, but normal UI should treat deleted category as unavailable.
- Reports may show deleted historical category as `(deleted category)` only if explicitly needed.

Budget delete:

- Soft-delete Budget
- Exclude from active budget report.

## Audit Log

Audit log implemented by PostgreSQL triggers, not app code.

Tables covered:

- Transaction
- Account
- Budget
- Category

Actions:

- INSERT
- UPDATE
- DELETE

Audit fields:

- id
- table_name
- record_id
- action
- old_data JSONB
- new_data JSONB
- timestamp

## Monthly Summary Payload

`MonthlySummary.payload_json` should contain aggregated data only.

Suggested shape:

```json
{
  "month": "2026-04",
  "currency": "IDR",
  "totalIncome": 12000000,
  "totalExpenses": 7500000,
  "netCashflow": 4500000,
  "savingsRate": 37.5,
  "categoryBreakdown": [
    {
      "categoryId": "uuid",
      "categoryName": "Food & Drinks",
      "amount": 2500000,
      "percentageOfExpenses": 33.3,
      "monthOverMonthDelta": 12.4
    }
  ],
  "budgetVariance": [
    {
      "categoryId": "uuid",
      "categoryName": "Food & Drinks",
      "budgetAmount": 2000000,
      "actualAmount": 2500000,
      "varianceAmount": 500000,
      "variancePercent": 25
    }
  ],
  "accountBalances": [
    {
      "accountId": "uuid",
      "accountName": "BCA",
      "type": "ASSET",
      "balanceIdr": 5000000
    }
  ],
  "trends": {
    "incomeMoMPercent": 10,
    "expenseMoMPercent": -5,
    "netCashflowMoMPercent": 20
  }
}
```

## Email Import Data

Current locked Prisma schema has no email import table. Plan can be implemented in two stages:

### Stage 1 — No Schema Change

- Fetch email
- Parse candidate data
- Show review screen in memory/session
- User confirms
- Create normal Transaction

Limitation:

- Harder duplicate tracking across sessions.

### Stage 2 — Requires Explicit Schema Approval

Add email import queue table only after user approves schema change.

Potential model:

```prisma
model EmailImport {
  id              String   @id @default(uuid())
  provider        String
  provider_msg_id String   @unique
  sender          String
  subject         String
  received_at     DateTime
  extracted_json  Json
  status          String
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  deleted_at      DateTime?
}
```

Status values:

- pending
- accepted
- ignored
- duplicate
- failed_parse

Do not add this without explicit user approval.

## AI Categorizer Data

Current locked Prisma schema has no categorization suggestion table. Plan can be implemented in two stages:

### Stage 1 — No Schema Change

- API returns suggestion directly.
- User accepts.
- Transaction `category_id` updated.

### Stage 2 — Requires Explicit Schema Approval

Add suggestion history only after user approves schema change.

Potential model:

```prisma
model CategorySuggestion {
  id             String   @id @default(uuid())
  transaction_id String
  category_id    String
  confidence     Decimal  @db.Decimal(5, 4)
  reason         String?
  status         String
  created_at     DateTime @default(now())
}
```

Do not add this without explicit user approval.

---

## Income Accounting (Category Type)

## Problem

Locked Prisma schema stores one Transaction row per account movement. GEMINI.md defines double-entry bookkeeping. Income logically needs two movements: income increases on INCOME account and asset increases on ASSET account. But schema has no mechanism for two-row income entry like transfers.

## Decision: Single-Row Income with Category

Use single-row income transactions on the ASSET account, categorized under income categories. This matches the locked schema without modification.

### How It Works

**Income entry:**

```
Transaction:
  account_id: BCA (ASSET)
  amount: 15000000
  type: debit          ← increases ASSET
  category_id: Salary  ← income category
  currency: IDR
  exchange_rate: 1
  date: 2026-04-01
  notes: "April salary"
```

**Expense entry:**

```
Transaction:
  account_id: BCA (ASSET)
  amount: 500000
  type: credit         ← decreases ASSET
  category_id: Food & Drinks  ← expense category
  currency: IDR
  exchange_rate: 1
  date: 2026-04-05
  notes: "Dinner at restoran"
```

### Why This Works

1. Balance computation stays correct — debit on ASSET increases balance
2. Income vs expense classification comes from **category type**, not transaction type
3. Category table needs a `type` field to distinguish income categories from expense categories
4. Reports filter by category type, not transaction type

### Required Schema Addition

Category model needs a type field. This is the **only schema change needed** to resolve income accounting without breaking locked rules.

```prisma
enum CategoryType {
  INCOME
  EXPENSE
  TRANSFER_FEE
}

model Category {
  // existing fields...
  type CategoryType @default(EXPENSE)
}
```

### Report Logic

**Income total:**

```sql
SELECT SUM(t.amount * t.exchange_rate)
FROM "Transaction" t
JOIN "Category" c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND t.transfer_group_id IS NULL
  AND c.type = 'INCOME'
  AND t.date >= $1 AND t.date < $2;
```

**Expense total:**

```sql
SELECT SUM(t.amount * t.exchange_rate)
FROM "Transaction" t
JOIN "Category" c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND t.transfer_group_id IS NULL
  AND c.type = 'EXPENSE'
  AND t.date >= $1 AND t.date < $2;
```

### Transaction Type vs Category Type

| Scenario | Transaction `type` | Category `type` | Effect |
|---|---|---|---|
| Salary received | debit (increases asset) | INCOME | Balance up, income total up |
| Bought food | credit (decreases asset) | EXPENSE | Balance down, expense total up |
| Transfer BCA→GoPay | credit + debit | N/A (transfer_group_id set) | Balance unchanged, excluded from P&L |
| Transfer fee | credit | TRANSFER_FEE | Balance down, fee in expense report |
| Credit card payment | credit (decreases asset) | N/A or special | Reduces liability |

### Validation Rules

- Income transaction: `type = 'debit'`, category must have `type = 'INCOME'`
- Expense transaction: `type = 'credit'`, category must have `type = 'EXPENSE'` or `type = 'TRANSFER_FEE'`
- Transfer: `transfer_group_id IS NOT NULL`, category optional
- Zod schema must validate category type matches transaction direction

### UI Implications

Add transaction form:

1. User picks Income / Expense / Transfer tab
2. Income tab shows only INCOME categories
3. Expense tab shows only EXPENSE categories
4. Transfer tab hides category (optional)
5. Category type is set at category creation time

### Seed Data Update

Categories need type assignment:

```
INCOME categories: Salary, Freelance, Bonus, Gift, Other Income
EXPENSE categories: Food & Drinks, Groceries, Transport, Rent, etc.
TRANSFER_FEE categories: Transfer Fees, Bank Fees
```

### Edge Cases

**Credit card income (refund/cashback):**

- Transaction on Credit Card (LIABILITY) account
- `type = 'debit'` (decreases liability)
- Category type = INCOME
- This is correct: refund reduces what you owe

**Income to liability account (debt payment received):**

- Rare but valid
- `type = 'debit'` on LIABILITY
- Category type = INCOME

**Uncategorized transaction:**

- `category_id = null`
- Not counted in income or expense until categorized
- AI categorizer should suggest category with correct type

## Action Items

1. Add `CategoryType` enum to schema (requires user approval)
2. Add `type` field to Category model
3. Update seed data with category types
4. Update all report queries to filter by category type
5. Update transaction creation to validate category type
6. Update AI categorizer to only suggest matching type categories
