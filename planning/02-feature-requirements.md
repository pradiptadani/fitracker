# 02 — Feature Requirements

## 1. Finance Tracker

### Accounts

Required features:

- Create account
- Edit account name, type, normal balance, currency
- Soft-delete account
- Cascade soft-delete account transactions in same `prisma.$transaction()`
- List active accounts
- Show computed balance per account
- Group accounts by type

Required pre-seed accounts:

- BCA — ASSET — debit
- Mandiri — ASSET — debit
- GoPay — ASSET — debit
- OVO — ASSET — debit
- Dana — ASSET — debit
- Cash — ASSET — debit
- Credit Card — LIABILITY — credit

Acceptance:

- No account stores balance.
- Deleted accounts disappear from normal UI.
- Deleted account transactions excluded from balances and reports.

### Categories

Required features:

- Create category
- Edit category
- Soft-delete category
- Parent category support through `parent_category_id`
- Category tree display
- Category used by transaction and budget

Suggested starter categories:

Income:

- Salary
- Freelance
- Bonus
- Gift
- Other Income

Expense:

- Food & Drinks
- Groceries
- Transport
- Rent
- Utilities
- Internet & Phone
- Health
- Shopping
- Entertainment
- Subscription
- Bank Fees
- Transfer Fees
- Family
- Education
- Travel
- Other Expense

### Transactions

Required features:

- Create income transaction
- Create expense transaction
- Edit transaction
- Soft-delete transaction
- Filter by account, category, date range, type, amount range, keyword
- Search notes
- Show recent transactions
- Mark uncategorized transactions
- Store amount as positive number only
- Store `currency` and `exchange_rate`

Income behavior:

- Usually credit to INCOME account and debit to ASSET account if full double-entry entry is later expanded.
- Current locked schema stores one transaction row per account movement. Keep current schema unless user explicitly approves schema change.

Expense behavior:

- Expense from asset account is `credit` on ASSET account.
- Expense category assigned through `category_id`.
- Expense account/category reporting must follow locked rules.

Validation:

- amount > 0
- date required
- account_id required
- type must be `debit` or `credit`
- currency default `IDR`
- exchange_rate default `1`
- category optional

### Transfers

Required features:

- Transfer source account to destination account
- Amount positive
- Source and destination cannot match
- Create two rows in single `prisma.$transaction()`
- Same `transfer_group_id`
- Source row type: `credit`
- Destination row type: `debit`
- Exclude from income/expense/P&L
- Optional transfer fee recorded as separate expense transaction

Acceptance:

- Transfer never changes total net worth, except optional fee.
- Transfer never appears as income or expense.
- If one row fails, neither row exists.

### Budgets

Required features:

- Create budget per category
- Edit budget
- Soft-delete budget
- Period field support: monthly first
- Start/end dates
- Budget progress display
- Budget variance in reports

Acceptance:

- Budget only counts non-transfer expense transactions.
- Deleted categories/budgets excluded.

## 2. AI Categorizer

Required features:

- Suggest category for uncategorized transaction
- Return suggested category id/name
- Return confidence: low/medium/high or 0–1 score
- Return short reason
- Let user accept suggestion
- Let user choose different category
- Save accepted category on transaction
- Batch suggest for multiple uncategorized transactions

Input allowed for categorization:

- notes
- amount
- currency
- date
- account name/type
- known category list
- merchant text from email import when available

Privacy:

- Do not include unrelated transactions.
- Do not send full email body unless needed for email extraction feature.
- Do not send raw transactions to monthly advice pipeline.

Local learning:

- If same merchant/notes pattern appears again, prefer previous accepted category.
- Use deterministic local rule before LLM when exact pattern match exists.

## 3. Fetch Email Finance Related

Required features:

- Search finance-related emails by sender/subject/body keywords
- Extract only likely transaction emails
- Create import queue item, not direct real transaction
- Show extracted data to user for review
- User confirms before real transaction write
- Duplicate detection

Finance email examples:

- Bank transaction alerts
- E-wallet receipts
- Card payment notifications
- Subscription invoices
- Marketplace receipts
- Utility bills

Extraction fields:

- email id/provider id
- sender
- subject
- received date
- merchant/payee
- amount
- currency
- transaction date
- account hint
- payment method hint
- reference number
- raw snippet
- confidence

Duplicate detection keys:

- provider message id
- reference number
- date + amount + merchant
- existing transaction near same date/amount/notes

Review states:

- pending
- accepted
- ignored
- duplicate
- failed_parse

## 4. Responsive Desktop And Mobile

Desktop:

- Sidebar navigation
- Dashboard cards
- Tables with filters
- Report charts
- Bulk review for AI/email imports

Mobile:

- Bottom navigation
- Floating Add button
- Large tap targets minimum 44px
- One-handed transaction entry
- Date amount category account visible above fold where possible
- Sticky save button
- Swipe or quick actions where safe

## 5. Easy Mobile Use

Fast add transaction flow:

1. Open app.
2. Tap Add.
3. Select Expense/Income/Transfer.
4. Enter amount.
5. Pick account.
6. Pick category or accept AI suggestion.
7. Add optional note.
8. Save.

Target:

- Common expense entry under 10 seconds.
- Minimal typing.
- Default date = today.
- Default currency = IDR.
- Recent categories appear first.
- Recently used account appears first.

## 6. Finance Report

Required reports:

- Monthly overview
- Income vs expenses
- Net cashflow
- Savings rate
- Category breakdown
- Top spending categories
- Budget variance
- Account balances
- Month-over-month delta
- Last 6 months trend
- AI advice

Report filters:

- month
- date range
- account
- category
- currency converted to IDR

Acceptance:

- Transfers excluded from P&L.
- Soft-deleted rows excluded.
- Foreign currency converted using stored `exchange_rate`.

---

## Settings Page

## Sections

Settings page at `/settings` with grouped sections. Mobile: stacked sections. Desktop: sidebar section nav + content.

### 1. Profile

- Display name (informational, single-user)
- Change password
- Session management (logout all devices)

### 2. Preferences

- Default currency (IDR locked as primary, but display option for others)
- Default account for new transactions
- Date format (DD/MM/YYYY or YYYY-MM-DD)
- Theme (Light / Dark / System)
- First day of week (Monday or Sunday)

### 3. Accounts

- Manage accounts (shortcut to `/accounts`)
- Reorder accounts for picker
- Archive (soft-delete) accounts

### 4. Categories

- Manage categories (shortcut to `/categories`)
- Reorder categories
- Bulk edit

### 5. AI Configuration

- Enable/disable AI categorization
- Enable/disable monthly advice
- Show AI usage this month (calls, estimated cost)
- Model selection (advanced)
- Clear local category learning/rules

### 6. Email Integration

- Email provider status (connected/disconnected)
- Connect Gmail button (OAuth flow)
- Disconnect email
- Last sync timestamp
- Manual fetch trigger
- Finance email search keywords (editable list)

### 7. Recurring Transactions

- Manage recurring templates (shortcut)
- Enable/disable auto-prompt for recurring
- Review upcoming recurring transactions

### 8. Data

- Export transactions as CSV
- Export full data as JSON backup
- Import from CSV
- Generate monthly summary manually
- Regenerate AI advice for a specific month
- View audit log (read-only)

### 9. Danger Zone

- Delete all transactions (requires confirmation + password)
- Reset app (delete all data, requires confirmation + password)

## Settings API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/settings` | Get all user settings |
| PATCH | `/api/settings` | Update settings |
| POST | `/api/settings/change-password` | Change password |
| POST | `/api/settings/export/csv` | Export transactions CSV |
| POST | `/api/settings/export/json` | Export full backup JSON |
| POST | `/api/settings/import/csv` | Import transactions CSV |
| GET | `/api/settings/audit-log` | Read audit log |

## Settings Storage

Store in a simple key-value table. Requires schema addition (needs user approval):

```prisma
model Setting {
  id         String   @id @default(uuid())
  key        String   @unique
  value      Json
  updated_at DateTime @updatedAt
}
```

Alternatively, store in a JSON file on disk since single-user. Decision: use DB for consistency and backup inclusion.

## Default Settings

```json
{
  "defaultCurrency": "IDR",
  "defaultAccountId": null,
  "dateFormat": "DD/MM/YYYY",
  "theme": "system",
  "firstDayOfWeek": "monday",
  "aiCategorizerEnabled": true,
  "aiMonthlyAdviceEnabled": true,
  "emailProviderConnected": false,
  "recurringAutoPrompt": true,
  "financeKeywords": ["transaksi", "pembayaran", "payment", "receipt", "invoice"]
}
```

## UI Layout

Mobile:

```
┌─────────────────────┐
│ ← Settings          │
├─────────────────────┤
│ Profile             │
│ Preferences         │
│ Accounts            │
│ Categories          │
│ AI Configuration    │
│ Email Integration   │
│ Recurring           │
│ Data                │
│ Danger Zone         │
└─────────────────────┘
```

Tap section → navigates to section page or expands accordion.

Desktop:

```
┌──────────┬──────────────────────────┐
│ Settings │                          │
│          │  Profile                 │
│ Profile  │  ┌────────────────────┐  │
│ Prefs    │  │ Name: [________]   │  │
│ Accounts │  │ [Change Password]  │  │
│ AI       │  └────────────────────┘  │
│ Email    │                          │
│ Data     │                          │
│ Danger   │                          │
└──────────┴──────────────────────────┘
```

---

## Recurring Transactions

## Problem

Many personal expenses repeat: rent, subscriptions, internet, phone, salary. User shouldn't manually enter these every month.

## Decision

Implement recurring transaction templates. App prompts user to confirm before creating (no silent auto-creation). This matches the "manual confirmation" product principle.

## Schema Addition (requires user approval)

```prisma
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
  day_of_month   Int?            // 1-28 (cap at 28 for safety)
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

## Frequency Options

| Frequency | Description | day_of_month |
|---|---|---|
| `weekly` | Every week | day of week (0-6) |
| `monthly` | Every month | 1-28 |
| `yearly` | Every year | ignored, uses created_at date |

Day capped at 28 to avoid issues with short months.

## Pre-seeded Recurring Templates

| Name | Amount | Account | Category | Frequency | Day |
|---|---|---|---|---|---|
| Rent | 3,000,000 | BCA | Rent | monthly | 1 |
| Internet | 500,000 | BCA | Internet & Phone | monthly | 5 |
| Phone | 150,000 | BCA | Internet & Phone | monthly | 10 |
| Netflix | 54,000 | Credit Card | Subscription | monthly | 15 |
| Spotify | 54,990 | Credit Card | Subscription | monthly | 20 |

User edits amounts and dates during onboarding.

## Flow

### Creation

1. User taps Add Recurring in Recurring section of Settings or dedicated page
2. Form: name, amount, account, category, frequency, day, notes
3. Save creates RecurringTransaction record
4. Shows in recurring list with next due date

### Monthly Prompt

1. On app load, check if any recurring transactions are due (next_due ≤ today)
2. Show banner or notification: "3 recurring transactions are due this month"
3. User taps to review
4. Review screen shows each due recurring with pre-filled data
5. User can:
   - Accept all (creates transactions for all)
   - Accept individually
   - Skip this month
   - Edit before accepting
   - Deactivate recurring
6. Accepted items create normal Transaction rows following all locked rules
7. `last_generated` and `next_due` updated

### Generation Logic

```typescript
async function generateDueRecurring(): Promise<RecurringTransaction[]> {
  const now = new Date();
  
  const due = await prisma.recurringTransaction.findMany({
    where: {
      active: true,
      deleted_at: null,
      next_due: { lte: now },
    },
    include: { account: true, category: true },
  });

  return due;
}

async function acceptRecurring(recurring: RecurringTransaction): Promise<void> {
  // Create transaction following locked rules
  await prisma.transaction.create({
    data: {
      account_id: recurring.account_id,
      amount: recurring.amount,
      currency: recurring.currency,
      type: recurring.type,
      category_id: recurring.category_id,
      date: new Date(),
      notes: recurring.notes || `[Recurring] ${recurring.name}`,
    },
  });

  // Update next_due
  const nextDue = calculateNextDue(recurring);
  await prisma.recurringTransaction.update({
    where: { id: recurring.id },
    data: {
      last_generated: new Date(),
      next_due: nextDue,
    },
  });
}

function calculateNextDue(recurring: RecurringTransaction): Date {
  const current = recurring.next_due;
  
  switch (recurring.frequency) {
    case 'weekly': {
      const next = new Date(current);
      next.setDate(next.getDate() + 7);
      return next;
    }
    case 'monthly': {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      next.setDate(Math.min(recurring.day_of_month || 1, 28));
      return next;
    }
    case 'yearly': {
      const next = new Date(current);
      next.setFullYear(next.getFullYear() + 1);
      return next;
    }
    default:
      return current;
  }
}
```

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/recurring` | List all recurring templates |
| POST | `/api/recurring` | Create recurring template |
| PATCH | `/api/recurring/[id]` | Update recurring template |
| DELETE | `/api/recurring/[id]` | Soft-delete recurring template |
| GET | `/api/recurring/due` | Get due recurring transactions |
| POST | `/api/recurring/[id]/accept` | Accept and generate |
| POST | `/api/recurring/[id]/skip` | Skip this month |
| POST | `/api/recurring/[id]/deactivate` | Deactivate recurring |

## UI

### Recurring List

```
┌─────────────────────────────────┐
│ Recurring Transactions           │
├─────────────────────────────────┤
│ 3 due this month          [→]   │
├─────────────────────────────────┤
│ 🔄 Rent                         │
│    Rp3.000.000 · BCA · Monthly  │
│    Next: 1 May 2026             │
│                                 │
│ 🔄 Internet                     │
│    Rp500.000 · BCA · Monthly    │
│    Next: 5 May 2026             │
│                                 │
│ ⏸️ Netflix (paused)             │
│    Rp54.000 · Card · Monthly    │
├─────────────────────────────────┤
│ [+ Add Recurring]               │
└─────────────────────────────────┘
```

### Due Review

```
┌─────────────────────────────────┐
│ Due This Month                   │
├─────────────────────────────────┤
│ ☑ Rent                          │
│   Rp3.000.000 · BCA · Rent      │
│   [Edit]  [Skip]                │
│                                 │
│ ☑ Internet                      │
│   Rp500.000 · BCA · Internet    │
│   [Edit]  [Skip]                │
│                                 │
│ ☑ Phone                         │
│   Rp150.000 · BCA · Phone       │
│   [Edit]  [Skip]                │
├─────────────────────────────────┤
│ [Accept All 3]  [Skip All]      │
└─────────────────────────────────┘
```

## Edge Cases

- User skips month → next_due advances but last_generated stays
- User deactivates → no longer prompts, can reactivate later
- Account soft-deleted → recurring shows warning, cannot generate
- Category soft-deleted → recurring shows warning, suggest reassigning
- Amount changes → only affects future generations, not past transactions

---

## Transaction Templates

## Problem

User frequently records same transactions: morning coffee, Grab ride, lunch at specific place. Tapping through form every time adds friction.

## Decision

Implement transaction templates — saved shortcuts for common transactions. One tap to create from template.

## How It Works

Templates are client-side only. Stored in localStorage via Zustand. No schema change needed.

### Data Structure

```typescript
interface TransactionTemplate {
  id: string;
  name: string;
  icon: string;          // emoji
  type: 'expense' | 'income';
  account_id: string;
  category_id: string;
  amount: number;
  currency: string;
  notes: string;
  usageCount: number;
  lastUsed: string;      // ISO date
}
```

### Storage

```typescript
// src/stores/template-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TemplateStore {
  templates: TransactionTemplate[];
  addTemplate: (template: Omit<TransactionTemplate, 'id' | 'usageCount' | 'lastUsed'>) => void;
  removeTemplate: (id: string) => void;
  incrementUsage: (id: string) => void;
  reorderTemplates: (ids: string[]) => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      
      addTemplate: (data) => set((state) => ({
        templates: [
          ...state.templates,
          {
            ...data,
            id: crypto.randomUUID(),
            usageCount: 0,
            lastUsed: new Date().toISOString(),
          },
        ],
      })),
      
      removeTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id),
      })),
      
      incrementUsage: (id) => set((state) => ({
        templates: state.templates
          .map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() } : t)
          .sort((a, b) => b.usageCount - a.usageCount),
      })),
      
      reorderTemplates: (ids) => set((state) => ({
        templates: ids.map(id => state.templates.find(t => t.id === id)!).filter(Boolean),
      })),
    }),
    { name: 'fintrack-templates' }
  )
);
```

## Creation Flow

### From Transaction Form

1. User fills out transaction form
2. Before saving, sees "Save as template" toggle
3. If toggled, user enters template name and optional emoji icon
4. On save: creates transaction AND saves template
5. Template appears in quick-add grid

### From Transaction Detail

1. User views existing transaction
2. Taps "⋯" menu
3. Selects "Save as template"
4. Pre-fills template from transaction data
5. User confirms name and icon

## Quick Add UI

### Mobile — Add Transaction Screen

Templates appear at top of add transaction form as horizontal scrollable chips:

```
┌─────────────────────────────────┐
│ Add Expense                      │
├─────────────────────────────────┤
│ Quick:                          │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │☕  │ │🚗  │ │🍜  │ │🛒  │   │
│ │Kopi│ │Grab│ │Lunch│ │Groc│   │
│ │25K │ │55K │ │50K │ │200K│   │
│ └────┘ └────┘ └────┘ └────┘   │
├─────────────────────────────────┤
│ Amount                          │
│ ┌───────────────────────────┐   │
│ │ Rp                  0     │   │
│ └───────────────────────────┘   │
│                                 │
│ Account: [BCA ▼]               │
│ Category: [Food & Drinks ▼]    │
│                                 │
│        [Save]                   │
└─────────────────────────────────┘
```

Tap chip → pre-fills amount, account, category, notes. User can still edit before saving.

### Desktop — Transaction Form

Templates appear as sidebar or top bar:

```
┌──────────────────────────────────────────────┐
│ Add Transaction                               │
├───────────────────┬──────────────────────────┤
│ Templates         │  Form                    │
│                   │                          │
│ ☕ Kopi     25K   │  Amount: [________]      │
│ 🚗 Grab     55K   │  Account: [BCA ▼]        │
│ 🍜 Lunch    50K   │  Category: [Food ▼]      │
│ 🛒 Groc    200K   │  Date: [Today ▼]         │
│                   │  Notes: [________]       │
│ [+ New Template]  │                          │
│                   │  [Save]                  │
└───────────────────┴──────────────────────────┘
```

## Usage Flow

1. Tap template chip
2. Form pre-fills with template data
3. Date defaults to today (always)
4. Amount, account, category, notes pre-filled
5. User can edit any field
6. Tap Save → creates transaction
7. Template usage count increments
8. Toast: "Saved! Template used 12 times"

## Management

### Settings → Transaction Templates

- List all templates with usage count
- Edit template details
- Delete template
- Reorder (drag to sort)
- Max 20 templates (prevent clutter)

### Auto-Suggest Templates

After user creates 3+ similar transactions (same category + similar amount range), suggest creating a template:

```
┌─────────────────────────────────┐
│ Create Template?                 │
│                                 │
│ You've added "Lunch" 5 times.   │
│ Save as a quick-add template?   │
│                                 │
│ Name: [Lunch]                   │
│ Icon: [🍜]                      │
│                                 │
│ [Create]  [No thanks]           │
└─────────────────────────────────┘
```

## Sorting

Templates sorted by:

1. Usage count (descending)
2. Last used (descending)
3. Created order (fallback)

Most-used templates appear first for fastest access.

## Edge Cases

- Template references deleted account → show warning, cannot use until reassigned
- Template references deleted category → show warning, cannot use until reassigned
- Template amount is 0 → user must enter amount manually
- More than 20 templates → hide least used, accessible from management page
