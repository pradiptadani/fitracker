# 01 — Product Scope

## Vision

Personal finance tracker focused on accurate manual tracking, fast mobile usage, AI-assisted categorization, email-assisted transaction discovery, and practical monthly financial advice.

## Target User

- Single user in Jakarta, Indonesia
- Tracks personal income and spending manually
- Uses IDR as primary currency
- May have multiple bank/e-wallet accounts: BCA, Mandiri, GoPay, OVO, Dana, Cash, Credit Card
- May receive finance activity by email: bank alerts, e-wallet receipts, subscription invoices, card statements, merchant receipts
- Wants clear reports, not complex accounting UI

## Core Jobs To Be Done

1. Record expense quickly after purchase.
2. Record income when money arrives.
3. Transfer money between accounts without counting it as income or expense.
4. Check account balances.
5. See where money went this month.
6. Compare spending against budgets.
7. Let AI suggest categories for new or imported transactions.
8. Fetch finance emails and convert relevant information into draft transactions.
9. Get monthly advice based on aggregated summaries.

## In Scope

### Finance Tracker

- Accounts
- Categories
- Transactions
- Transfers
- Budgets
- Computed balances
- Soft deletes
- Audit logs
- Multi-currency fields with IDR aggregation

### AI Categorizer

- Suggest category for transaction from merchant, notes, amount, account, and date context
- Show confidence score
- Let user accept, reject, or change suggestion
- Learn from accepted categories through local rules/history

### Email Finance Fetcher

- Connect email provider or import email content through controlled integration
- Search finance-related emails only
- Extract candidate merchant, amount, date, currency, payment account hint, and reference number
- Create draft transactions for user review
- Avoid duplicate imports

### Responsive UI

- Desktop dashboard and management pages
- Mobile-first transaction entry
- Touch-friendly controls
- PWA-ready layout

### Finance Reports

- Monthly summary
- Income vs expense
- Category breakdown
- Budget variance
- Account balance summary
- Cashflow trend
- AI monthly advice from summary records

## Out of Scope

- Multi-user collaboration
- Cloud database
- Bank API sync
- Automatic direct bank login/scraping
- Tax filing
- Investment portfolio tracking beyond manual accounts
- Invoice management
- Payroll automation
- Raw transaction rows sent to monthly AI advisor

## Product Principles

1. Accuracy over automation.
2. Manual confirmation before imported email creates real transaction.
3. Mobile entry must be fastest path.
4. Accounting rules stay hidden where possible but correct underneath.
5. Reports must answer practical questions: what came in, what went out, what changed, what needs attention.
6. Privacy boundary must be clear: email extraction and categorization may inspect minimal transaction context, monthly advice only receives summaries.

## Primary Navigation

- Dashboard
- Add Transaction
- Transactions
- Accounts
- Categories
- Budgets
- Email Imports
- Reports
- Settings

## MVP Definition

MVP complete when user can:

1. Login with iron-session.
2. Create/edit/soft-delete accounts and categories.
3. Add income, expense, and transfer.
4. View computed account balances.
5. View transaction list with filters.
6. Add monthly budgets.
7. See monthly report.
8. Run AI categorization on uncategorized transaction.
9. Fetch or paste finance email content into review queue.
10. Use app comfortably on mobile.

---

## Onboarding Flow

## Goal

First-time user sees a guided experience that sets up accounts, confirms categories, and records first transaction — all within 2 minutes.

## Trigger

Onboarding shows when:

- User has no transactions AND
- User has no accounts beyond seed accounts

Detection:

```typescript
async function needsOnboarding(): Promise<boolean> {
  const [txCount, accountCount] = await Promise.all([
    prisma.transaction.count({ where: { deleted_at: null } }),
    prisma.account.count({ where: { deleted_at: null } }),
  ]);
  return txCount === 0;
}
```

## Onboarding Steps

### Step 1: Welcome

```
┌─────────────────────────────────┐
│                                 │
│        💰                       │
│   Financial Tracker             │
│                                 │
│   Track your money,             │
│   get AI-powered advice.        │
│                                 │
│   Let's set things up.          │
│   Takes about 2 minutes.        │
│                                 │
│        [Get Started]            │
│                                 │
│        [Skip for now]           │
└─────────────────────────────────┘
```

### Step 2: Confirm Accounts

Show pre-seeded accounts. User can:

- Keep all
- Remove unused (tap to toggle off)
- Add custom accounts
- Edit names

```
┌─────────────────────────────────┐
│ Your Accounts                    │
│ Which accounts do you use?      │
├─────────────────────────────────┤
│ ☑ BCA                           │
│ ☑ Mandiri                       │
│ ☑ GoPay                         │
│ ☑ OVO                           │
│ ☐ Dana                          │
│ ☑ Cash                          │
│ ☐ Credit Card                   │
│                                 │
│ [+ Add Account]                 │
│                                 │
│        [Continue]               │
└─────────────────────────────────┘
```

### Step 3: Confirm Categories

Show starter categories in a scrollable list. User can toggle, rename, or add.

```
┌─────────────────────────────────┐
│ Spending Categories              │
│ Keep what's relevant to you.    │
├─────────────────────────────────┤
│ INCOME                          │
│ ☑ Salary  ☑ Freelance           │
│ ☑ Bonus   ☐ Gift                │
│                                 │
│ EXPENSE                         │
│ ☑ Food & Drinks  ☑ Groceries    │
│ ☑ Transport      ☑ Rent         │
│ ☑ Utilities      ☐ Internet     │
│ ☑ Health         ☑ Shopping     │
│ ☑ Entertainment  ☑ Subscription │
│ ☐ Bank Fees      ☐ Education    │
│ ☐ Travel         ☑ Other        │
│                                 │
│ [+ Add Category]                │
│                                 │
│        [Continue]               │
└─────────────────────────────────┘
```

### Step 4: Add First Transaction

Guide user to add their first expense.

```
┌─────────────────────────────────┐
│ Let's add your first expense     │
│                                 │
│ What did you spend on today?    │
│                                 │
│ Amount                          │
│ ┌───────────────────────────┐   │
│ │ Rp                  0     │   │
│ └───────────────────────────┘   │
│                                 │
│ Account: [BCA ▼]               │
│ Category: [Food & Drinks ▼]    │
│ Note: [optional]               │
│                                 │
│        [Save First Expense]     │
│                                 │
│        [Skip]                   │
└─────────────────────────────────┘
```

### Step 5: Setup Recurring (Optional)

```
┌─────────────────────────────────┐
│ Monthly Expenses?                │
│                                 │
│ Set up automatic reminders for  │
│ bills that repeat each month.   │
│                                 │
│ ☐ Rent          Rp_________    │
│ ☐ Internet      Rp_________    │
│ ☐ Phone         Rp_________    │
│ ☐ Subscriptions Rp_________    │
│                                 │
│        [Save Recurring]         │
│                                 │
│        [Skip]                   │
└─────────────────────────────────┘
```

### Step 6: Done

```
┌─────────────────────────────────┐
│                                 │
│        ✅                       │
│   You're all set!               │
│                                 │
│   Your accounts are ready.      │
│   Start tracking your money.    │
│                                 │
│   Tips:                         │
│   • Tap + to add transactions   │
│   • AI will suggest categories  │
│   • Check reports monthly       │
│                                 │
│        [Go to Dashboard]        │
└─────────────────────────────────┘
```

## Skip Behavior

If user skips onboarding:

- Seed accounts remain (all pre-seeded)
- Seed categories remain (all pre-seeded)
- No recurring templates created
- User goes directly to dashboard with empty state guidance

## Onboarding State

Track in Setting table:

```json
{
  "key": "onboarding_completed",
  "value": { "completed": true, "completedAt": "2026-04-18T10:00:00Z", "stepsCompleted": [1,2,3,4,6] }
}
```

## API Route

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/onboarding/status` | Check if onboarding needed |
| POST | `/api/onboarding/complete` | Mark onboarding complete with step data |

## Mobile Considerations

- Each step is full-screen on mobile
- Progress indicator at top (dots or bar)
- Back button on each step
- Keyboard auto-opens on amount input
- Swipe between steps optional
