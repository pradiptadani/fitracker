# 07 — Reporting Plan

## Report Principles

- Reports use active records only.
- Transfers excluded from P&L.
- Foreign currency converted using stored `exchange_rate`.
- Values displayed in IDR by default.
- Monthly summaries stored in `MonthlySummary`.
- AI advice generated from last 6 monthly summaries only.

## Core Metrics

### Income

Total non-transfer income for selected period.

Rules:

- Exclude `transfer_group_id IS NOT NULL`.
- Exclude soft-deleted rows.
- Convert amount to IDR: `amount * exchange_rate`.

### Expenses

Total non-transfer expenses for selected period.

Rules:

- Exclude transfers.
- Exclude soft-deleted rows.
- Convert to IDR.

### Net Cashflow

Formula:

```text
total_income - total_expenses
```

### Savings Rate

Formula:

```text
(total_income - total_expenses) / total_income * 100
```

If income is 0:

- Display `N/A`.

### Budget Variance

Formula:

```text
actual_expense - budget_amount
```

Variance percent:

```text
(actual_expense - budget_amount) / budget_amount * 100
```

## Reports

### 1. Monthly Overview

Inputs:

- month

Outputs:

- total income
- total expenses
- net cashflow
- savings rate
- top 5 categories
- over-budget categories
- AI advice if available

### 2. Category Breakdown

Inputs:

- date range
- account optional

Outputs:

- category name
- total amount
- percent of total expenses
- MoM delta
- transaction count

Visualization:

- donut chart on desktop
- ranked list on mobile

### 3. Income Report

Outputs:

- income by category/source
- income by account
- monthly trend
- irregular income notes

### 4. Expense Report

Outputs:

- expense by category
- expense by account
- daily average spending
- largest transactions
- recurring-looking merchants from notes/email imports if available

### 5. Account Balance Report

Outputs:

- current balance per account
- account type
- total assets
- total liabilities
- net worth approximation

Rules:

- Use computed balance query.
- Never stored balance.

### 6. Budget Report

Outputs:

- category
- budget amount
- actual amount
- remaining amount
- variance amount
- variance percent
- status: under / near / over

Status rules:

- under: actual < 80% budget
- near: actual between 80% and 100%
- over: actual > 100%

### 7. Trend Report

Outputs:

- last 6 months income
- last 6 months expenses
- last 6 months net cashflow
- category trend changes
- budget variance trend

## MonthlySummary Generation

### Schedule

- Run at end of month.
- Also allow manual run from admin/settings page.

### Steps

1. Determine month start/end in Jakarta timezone.
2. Aggregate active non-transfer income.
3. Aggregate active non-transfer expenses.
4. Aggregate category breakdown.
5. Aggregate budget variance.
6. Compute account balances.
7. Compute MoM deltas using previous month summary.
8. Save `MonthlySummary`.
9. Fetch last 6 `MonthlySummary` records.
10. Send summaries only to LLM.
11. Save response to `ai_advice_given`.

## Report API Queries

Common filters:

- `startDate`
- `endDate`
- `accountId`
- `categoryId`

Common SQL filters:

```sql
WHERE t.deleted_at IS NULL
  AND a.deleted_at IS NULL
  AND t.transfer_group_id IS NULL
  AND t.date >= $1
  AND t.date < $2
```

## Acceptance Criteria

- Transfer between BCA and GoPay does not affect income/expense.
- Transfer fee appears as expense category `Transfer Fees`.
- Deleted transaction disappears from reports.
- Deleted account transaction disappears from reports after cascade soft delete.
- Foreign currency amount uses stored exchange rate, not current live rate.
- AI advice can be regenerated without exposing raw transactions.
