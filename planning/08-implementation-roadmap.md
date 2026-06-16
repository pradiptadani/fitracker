# 08 — Implementation Roadmap

## Phase 0 — Project Baseline

Tasks:

1. Confirm locked stack and schema.
2. Confirm existing routes/components.
3. Ensure local dev runs.
4. Ensure Prisma migrate/seed works.
5. Ensure login/logout works.

Acceptance:

- `npm run dev` starts.
- User can login.
- Database connection works.
- Seed creates starter accounts/categories.

## Phase 1 — Core Finance Tracker

Tasks:

1. Accounts CRUD.
2. Categories CRUD/tree.
3. Transactions CRUD.
4. Transfer creation with two rows.
5. Computed balances.
6. Soft delete account cascade.
7. Audit triggers migration.

Acceptance:

- Account balance computed from transactions.
- Transfer creates two rows with same `transfer_group_id`.
- Transfer excluded from transaction reports.
- Soft-deleted account hides related transactions.

## Phase 2 — Mobile-First UI

Tasks:

1. App shell responsive layout.
2. Desktop sidebar.
3. Mobile bottom nav.
4. Floating Add button.
5. Mobile add transaction form.
6. Mobile transaction cards.
7. Currency/date formatting.

Acceptance:

- Common expense can be added in under 10 seconds.
- UI usable on phone width.
- Buttons meet 44px target.
- Desktop tables still readable.

## Phase 3 — Budgets And Reports

Tasks:

1. Budgets CRUD.
2. Budget progress API.
3. Monthly overview report.
4. Category breakdown report.
5. Account balance report.
6. Trend report.
7. MonthlySummary generator.

Acceptance:

- Reports exclude transfers.
- Reports exclude soft-deleted records.
- Budget variance correct.
- MonthlySummary contains aggregated JSON.

## Phase 4 — AI Categorizer

Tasks:

1. Uncategorized transaction list.
2. Category suggestion API.
3. LLM prompt with allowed fields only.
4. Suggestion UI.
5. Accept/change suggestion flow.
6. Batch suggestion endpoint.

Acceptance:

- AI returns category from existing list only.
- User must confirm suggestion.
- Low confidence not auto-applied.
- Accepted category updates transaction.

## Phase 5 — Email Finance Fetcher

Tasks:

1. Manual paste/import MVP.
2. Email parser API.
3. Finance email detection rules.
4. Candidate transaction preview UI.
5. Duplicate detection.
6. Accept/edit/ignore flow.
7. Optional provider integration later.

Acceptance:

- Email import creates draft only.
- User confirms before transaction creation.
- Duplicate candidates flagged.
- Parsed amount/date/merchant visible.

## Phase 6 — Monthly AI Advice

Tasks:

1. Generate monthly summary manually.
2. Cron-compatible monthly summary job.
3. Fetch last 6 summaries.
4. LLM advice prompt.
5. Save advice to `MonthlySummary.ai_advice_given`.
6. Show advice in reports/dashboard.

Acceptance:

- LLM receives only monthly summary data.
- Advice saved and displayed.
- Last 6 summaries included when available.

## Phase 7 — Deployment

Tasks:

1. Dockerfile.
2. Docker Compose with app + Postgres.
3. Environment variables.
4. Prisma migration at deploy.
5. Reverse proxy config notes.
6. HTTPS enforced at proxy.
7. Backup plan.

Acceptance:

- App runs on Oracle VPS through Docker.
- Database persists volume.
- HTTPS works via Nginx/Traefik.
- Backups documented.

## Suggested Build Order

1. Fix/finish existing finance CRUD.
2. Add mobile-first transaction entry.
3. Add reporting.
4. Add AI categorizer.
5. Add email import MVP.
6. Add monthly AI advice.
7. Harden deployment.

## MVP Cut Line

Must have:

- auth
- accounts
- categories
- transactions
- transfers
- computed balances
- mobile add flow
- basic monthly report

Should have:

- budgets
- AI categorizer
- email import paste parser
- monthly AI advice

Later:

- persistent email import queue table
- Gmail integration
- suggestion history table
- advanced charts

---

## Medium Gaps: Folder Structure, Deployment, Environment

## 21.1 Pagination Strategy

### Decision: Cursor-Based with Infinite Scroll on Mobile

**Why cursor-based:**

- Stable when new transactions added
- No offset recalculation
- Works well with Prisma

**Why infinite scroll on mobile:**

- Natural gesture
- No tiny page number buttons
- Feels native

### API Response Shape

```typescript
interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;  // null = last page
  totalCount: number;
}
```

### Prisma Implementation

```typescript
const PAGE_SIZE = 20;

async function getTransactions(filters: TransactionFilters) {
  const where = buildWhereClause(filters);
  
  const items = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: PAGE_SIZE + 1,  // fetch one extra to know if there's more
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : 0,  // skip cursor item
    include: { account: true, category: true },
  });

  const hasMore = items.length > PAGE_SIZE;
  if (hasMore) items.pop();

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    totalCount: await prisma.transaction.count({ where }),
  };
}
```

### Mobile: Infinite Scroll

```typescript
// Using TanStack Query infinite query
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['transactions', 'list', filters],
  queryFn: ({ pageParam }) => fetchTransactions({ ...filters, cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: null,
});

// Intersection observer for auto-load
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
  );
  
  if (loadMoreRef.current) observer.observe(loadMoreRef.current);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage]);
```

### Desktop: "Load More" Button

Simpler than pagination numbers. Click loads next page.

```tsx
{hasNextPage && (
  <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    {isFetchingNextPage ? 'Loading...' : 'Load More'}
  </Button>
)}
```

### Search

For notes search, use PostgreSQL `ILIKE` or `to_tsvector`:

```sql
-- Simple search (sufficient for single-user, small dataset)
WHERE t.notes ILIKE '%' || $search || '%'

-- Full-text search (if dataset grows)
WHERE to_tsvector('english', t.notes) @@ plainto_tsquery('english', $search)
```

Index for search:

```sql
CREATE INDEX idx_transaction_notes_gin ON "Transaction" USING gin(to_tsvector('english', notes));
```

---

## 21.2 Cron Implementation

### Decision: Node-Cron Inside Next.js

Use `node-cron` library running inside the Next.js server process. Simple, no external cron daemon needed.

```bash
npm install node-cron
```

### Setup

```typescript
// src/lib/cron.ts
import cron from 'node-cron';
import { generateMonthlySummary } from './reports/monthly-summary';

let initialized = false;

export function initCronJobs() {
  if (initialized) return;
  initialized = true;

  // Run on last day of month at 23:55 WIB (16:55 UTC)
  cron.schedule('55 16 28-31 * *', async () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Only run if today is the last day of the month
    if (now.getDate() === lastDay.getDate()) {
      console.log('[CRON] Running monthly summary generation...');
      try {
        await generateMonthlySummary();
        console.log('[CRON] Monthly summary generated successfully');
      } catch (error) {
        console.error('[CRON] Monthly summary generation failed:', error);
      }
    }
  }, {
    timezone: 'Asia/Jakarta',
  });

  console.log('[CRON] Cron jobs initialized');
}
```

### Instrumentation

```typescript
// src/instrumentation.ts (Next.js instrumentation hook)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initCronJobs } = await import('./lib/cron');
    initCronJobs();
  }
}
```

### Manual Trigger

Settings page has "Generate Monthly Summary" button that calls `/api/reports/monthly-summary/run`.

### Failure Handling

- If cron fails, log error
- Manual trigger available in Settings
- MonthlySummary creation is idempotent (upsert by month)
- Next successful run will catch up

---

## 21.3 Multi-Currency UX

### Decision: Manual Exchange Rate Entry

For MVP, user enters exchange rate manually. Most transactions are IDR. Foreign currency is rare (travel, online purchases).

### Transaction Form

When currency is not IDR, show exchange rate field:

```
┌─────────────────────────────────┐
│ Add Expense                      │
├─────────────────────────────────┤
│ Amount                          │
│ ┌───────────────────────────┐   │
│ │ USD                50.00  │   │
│ └───────────────────────────┘   │
│                                 │
│ Exchange Rate (to IDR)          │
│ ┌───────────────────────────┐   │
│ │ 1 USD = Rp        15.500  │   │
│ └───────────────────────────┘   │
│ IDR equivalent: Rp775.000       │
│                                 │
│ Account: [BCA ▼]               │
│ Category: [Shopping ▼]         │
│                                 │
│        [Save]                   │
└─────────────────────────────────┘
```

### Currency Selector

Common currencies shown first:

```
IDR - Indonesian Rupiah  ★
USD - US Dollar
EUR - Euro
SGD - Singapore Dollar
JPY - Japanese Yen
THB - Thai Baht
MYR - Malaysian Ringgit
Other...
```

### Reports Display

All reports show IDR totals. Non-IDR transactions show conversion:

```
Shopping - Rp775.000 (USD 50.00 × 15,500)
```

### Future: API-Based Rates

Optional setting to auto-fetch exchange rate from free API (exchangerate.host) at transaction time. Stored rate is always what was used — never recalculated.

---

## 21.4 Error Handling & Loading States

### Global Error Boundary

```tsx
// src/app/error.tsx (Next.js app router error boundary)
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

### API Error Toast

```typescript
// src/lib/api-client.ts
import { toast } from 'sonner';

export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Request failed (${response.status})`);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    }
    throw error;
  }
}
```

### Loading Skeletons

Each page type has a matching skeleton:

- `TransactionListSkeleton` — 5 shimmering cards
- `DashboardSkeleton` — 4 stat cards + chart placeholder
- `ReportSkeleton` — cards + chart area
- `FormSkeleton` — input placeholders

### Optimistic Save Indicator

```tsx
// Show saving state on transaction form
const { mutate, isPending, isSuccess } = useCreateTransaction();

<Button disabled={isPending}>
  {isPending ? (
    <><Spinner /> Saving...</>
  ) : isSuccess ? (
    <><Check /> Saved!</>
  ) : (
    'Save'
  )}
</Button>
```

### Retry Pattern

```tsx
function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">Failed to load</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
```

---

## 21.5 File/Folder Structure

```
src/
  app/
    layout.tsx                    # Root layout (providers, metadata)
    page.tsx                      # Redirect to /dashboard or /login
    globals.css                   # Tailwind imports + custom styles
    error.tsx                     # Global error boundary
    not-found.tsx                 # 404 page
    (auth)/
      layout.tsx                  # Auth layout (no sidebar/nav)
      login/
        page.tsx                  # Login page
    (app)/
      layout.tsx                  # App layout (sidebar, bottom nav, providers)
      dashboard/
        page.tsx                  # Dashboard
      transactions/
        page.tsx                  # Transaction list
        new/
          page.tsx                # Add transaction form
        [id]/
          page.tsx                # Transaction detail/edit
      accounts/
        page.tsx                  # Account list
        [id]/
          page.tsx                # Account detail
      categories/
        page.tsx                  # Category management
      budgets/
        page.tsx                  # Budget management
      email-imports/
        page.tsx                  # Email import review
      reports/
        page.tsx                  # Reports hub
        monthly/
          page.tsx                # Monthly report
      recurring/
        page.tsx                  # Recurring transactions
      settings/
        page.tsx                  # Settings
    api/
      auth/
        login/route.ts
        logout/route.ts
        me/route.ts
      accounts/
        route.ts
        [id]/
          route.ts
          balance/route.ts
      categories/
        route.ts
        [id]/route.ts
      transactions/
        route.ts
        [id]/route.ts
        transfer/route.ts
        uncategorized/route.ts
      budgets/
        route.ts
        [id]/route.ts
        progress/route.ts
      recurring/
        route.ts
        [id]/route.ts
        due/route.ts
      ai/
        categorize/
          route.ts
          batch/route.ts
      email/
        search-finance/route.ts
        parse/route.ts
        accept/route.ts
      reports/
        monthly/route.ts
        cashflow/route.ts
        categories/route.ts
        trend/route.ts
        monthly-summary/
          run/route.ts
          advise/route.ts
      settings/
        route.ts
        export/route.ts
      health/route.ts
  components/
    ui/                           # shadcn/ui primitives
    layout/
      app-shell.tsx
      sidebar-nav.tsx
      bottom-nav.tsx
      header.tsx
    transaction/
      transaction-form.tsx
      transfer-form.tsx
      transaction-card.tsx
      transaction-list.tsx
      transaction-filters.tsx
      amount-input.tsx
      category-picker.tsx
      account-picker.tsx
      floating-add-button.tsx
      template-chips.tsx
    report/
      stat-card.tsx
      category-chart.tsx
      trend-chart.tsx
      budget-bar.tsx
      monthly-overview.tsx
    ai/
      confidence-badge.tsx
      suggestion-card.tsx
      categorize-button.tsx
    email/
      import-card.tsx
      import-review-list.tsx
      paste-dialog.tsx
    shared/
      month-selector.tsx
      empty-state.tsx
      loading-skeleton.tsx
      error-boundary.tsx
      confirm-dialog.tsx
      offline-indicator.tsx
      install-prompt.tsx
  hooks/
    use-accounts.ts
    use-transactions.ts
    use-categories.ts
    use-budgets.ts
    use-reports.ts
    use-transaction-filters.ts
  stores/
    ui-store.ts
    recent-store.ts
    template-store.ts
  lib/
    prisma.ts
    session.ts
    balance.ts
    transfer.ts
    query-provider.tsx
    format.ts                     # Currency, date formatting
    api-client.ts                 # Client-side fetch wrapper
    cron.ts                       # Cron job setup
    instrumentation.ts
    accounts.ts
    categories.ts
    transactions.ts
    reports.ts
    recurring.ts
    ai/
      llm-client.ts
      categorize.ts
      monthly-advice.ts
      prompts.ts
      rate-limit.ts
    email/
      parse.ts
      search.ts
      gmail.ts
    offline/
      queue.ts
      sync.ts
  types/
    transaction.ts
    account.ts
    category.ts
    budget.ts
    report.ts
    email.ts
  constants/
    accounts.ts                   # Pre-seed account definitions
    categories.ts                 # Pre-seed category definitions
    currencies.ts                 # Currency list
    index.ts
prisma/
  schema.prisma
  seed.ts
  migrations/
  sql/
    audit-triggers.sql            # Audit log trigger migration
    indexes.sql                   # Custom indexes
```

---

## 21.6 Database Index Strategy

### Required Indexes

```sql
-- Transaction indexes
CREATE INDEX idx_transaction_account_id ON "Transaction"(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transaction_category_id ON "Transaction"(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transaction_date ON "Transaction"(date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transaction_transfer_group ON "Transaction"(transfer_group_id) WHERE transfer_group_id IS NOT NULL;
CREATE INDEX idx_transaction_account_date ON "Transaction"(account_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transaction_category_date ON "Transaction"(category_id, date DESC) WHERE deleted_at IS NULL;

-- Report query composite index
CREATE INDEX idx_transaction_report ON "Transaction"(date, deleted_at, transfer_group_id) WHERE deleted_at IS NULL;

-- Full-text search on notes
CREATE INDEX idx_transaction_notes_gin ON "Transaction" USING gin(to_tsvector('english', COALESCE(notes, '')));

-- Budget period lookup
CREATE INDEX idx_budget_period ON "Budget"(start_date, end_date) WHERE deleted_at IS NULL;

-- Monthly summary month lookup
CREATE INDEX idx_monthly_summary_month ON "MonthlySummary"(month DESC);

-- Category parent lookup
CREATE INDEX idx_category_parent ON "Category"(parent_category_id) WHERE deleted_at IS NULL;
```

### When to Add

Add indexes after initial data exists. Monitor with `EXPLAIN ANALYZE` on slow queries.

---

## 21.7 Authentication Details

### Password Storage

Use bcrypt with cost factor 12.

```typescript
// src/lib/auth.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Storage Location

Single-user app. Store hashed password in env var for simplicity:

```env
AUTH_PASSWORD_HASH=$2b$12$...
AUTH_USER=***
```

If user wants password change feature, store in Setting table instead.

### Session Configuration

```typescript
// src/lib/session.ts
import { getIronSession } from 'iron-session';

export const sessionOptions = {
  cookieName: 'fintrack_session',
  password: process.env.SESSION_SECRET!,  // min 32 chars
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,  // 30 days
    path: '/',
  },
};

interface SessionData {
  userId: string;
  isLoggedIn: boolean;
}

export async function getSession(req?: Request) {
  // ... iron-session implementation
}
```

### Session Refresh

On every authenticated request, if session is older than 7 days, extend expiry:

```typescript
export async function refreshSessionIfNeeded(session: IronSession<SessionData>) {
  // iron-session auto-refreshes on save
  await session.save();
}
```

### Login Rate Limiting

```typescript
// Simple in-memory rate limit for single-user
const loginAttempts = new Map<string, { count: number; resetAt: Date }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = new Date();
  const entry = loginAttempts.get(ip);
  
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: new Date(now.getTime() + 15 * 60 * 1000) });
    return true;
  }
  
  if (entry.count >= 5) return false;  // 5 attempts per 15 minutes
  entry.count++;
  return true;
}
```

### Environment Variables

```env
SESSION_SECRET=<min 32 character random string>
AUTH_USER=admin
AUTH_PASSWORD_HASH=<bcrypt hash>
```

---

## 21.8 Monitoring & Observability

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    app: true,
    database: false,
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {}
  
  const healthy = Object.values(checks).every(Boolean);
  
  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
```

### Error Tracking

For self-hosted, use simple file logging + optional Sentry:

```typescript
// src/lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || ''),
  error: (msg: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${msg}`, error?.stack || '', data || '');
    // Optional: send to Sentry
    // Sentry.captureException(error, { extra: data });
  },
};
```

### AI Call Logging

Log AI calls to Setting table or console:

```typescript
async function logAICall(type: string, model: string, tokens: number, cost: number, duration: number) {
  logger.info(`AI call: ${type}`, { model, tokens, cost, duration });
}
```

### Uptime Monitoring

Use external service (UptimeRobot free tier) to ping `/api/health` every 5 minutes.

---

## 21.9 Notification System

### Decision: In-App Only (No Push for MVP)

Notifications appear as badges in the app. No browser push notifications in MVP.

### Notification Types

| Type | Trigger | Badge Location |
|---|---|---|
| Budget Warning | Category spending > 80% of budget | Dashboard, Budgets nav |
| Budget Overrun | Category spending > 100% of budget | Dashboard, Budgets nav |
| Recurring Due | Recurring transaction due | Dashboard, Recurring nav |
| Monthly Summary Ready | End of month summary generated | Reports nav |
| AI Advice Ready | Monthly AI advice generated | Dashboard |
| Uncategorized | Transactions without category | Transactions nav |
| Email Import | New email candidates to review | Email Imports nav |

### Implementation

Simple computed notifications. No DB table needed.

```typescript
// src/lib/notifications.ts
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  count?: number;
}

export async function getNotifications(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  
  // Check budget warnings
  const budgetWarnings = await getBudgetWarnings();
  if (budgetWarnings.length > 0) {
    notifications.push({
      id: 'budget-warning',
      type: 'warning',
      title: `${budgetWarnings.length} budget warning${budgetWarnings.length > 1 ? 's' : ''}`,
      message: budgetWarnings.map(b => b.categoryName).join(', '),
      href: '/budgets',
      count: budgetWarnings.length,
    });
  }
  
  // Check recurring due
  const dueCount = await getRecurringDueCount();
  if (dueCount > 0) {
    notifications.push({
      id: 'recurring-due',
      type: 'info',
      title: `${dueCount} recurring transaction${dueCount > 1 ? 's' : ''} due`,
      message: 'Review and accept recurring transactions',
      href: '/recurring',
      count: dueCount,
    });
  }
  
  // Check uncategorized
  const uncatCount = await getUncategorizedCount();
  if (uncatCount > 0) {
    notifications.push({
      id: 'uncategorized',
      type: 'info',
      title: `${uncatCount} uncategorized transaction${uncatCount > 1 ? 's' : ''}`,
      message: 'Categorize for better reports',
      href: '/transactions?uncategorized=true',
      count: uncatCount,
    });
  }
  
  return notifications;
}
```

### UI

Notification bell icon in header with badge count. Tap to see list.

```tsx
<NotificationBell count={notifications.length} />
```
