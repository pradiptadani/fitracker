# 06 — UI/UX Plan

## Design Goals

- Fast daily transaction entry
- Clear financial overview
- Easy review of AI/email suggestions
- Mobile-first but desktop-capable
- Low cognitive load

## Layout Strategy

### Desktop

Use app shell:

- Left sidebar navigation
- Top header with current month and quick actions
- Main content area
- Cards for summaries
- Tables for management pages

Desktop routes:

- `/dashboard`
- `/transactions`
- `/transactions/new`
- `/accounts`
- `/categories`
- `/budgets`
- `/email-imports`
- `/reports`
- `/settings`

### Mobile

Use app shell:

- Bottom navigation
- Floating add button
- Full-screen add/edit forms
- Card lists instead of wide tables
- Sticky primary action button

Bottom nav items:

- Dashboard
- Transactions
- Add
- Reports
- More

## Mobile Add Transaction Flow

### Expense

Fields, ordered:

1. Amount
2. Account
3. Category
4. Date
5. Notes
6. Save

Defaults:

- date = today
- currency = IDR
- account = last used
- category suggestions from recent + AI

UX:

- Numeric keypad on amount field
- Rupiah format while typing
- Recent categories as chips
- Save button sticky bottom
- One tap to switch income/expense/transfer

### Income

Fields:

1. Amount
2. Account receiving money
3. Category/source
4. Date
5. Notes
6. Save

### Transfer

Fields:

1. Amount
2. From account
3. To account
4. Optional fee toggle
5. Fee amount/category/account if enabled
6. Date
7. Notes
8. Save

Validation display:

- Source and destination cannot be same.
- Amount required.
- Fee must be separate expense.

## Dashboard

### Mobile Dashboard Cards

- Current month spending
- Current month income
- Net cashflow
- Top spending category
- Budget warnings
- Account balance list
- Recent transactions

### Desktop Dashboard

- Total assets
- Liabilities
- Net worth approximation
- Month income
- Month expenses
- Savings rate
- Spending by category chart
- Last 6 months trend
- Recent transactions table
- AI advice card

## Transactions Page

### Desktop

Table columns:

- Date
- Account
- Category
- Notes/Merchant
- Type
- Amount
- Actions

Filters:

- date range
- account
- category
- type
- transfer/non-transfer
- search

### Mobile

Transaction card:

- amount prominent
- category chip
- account name
- date
- notes first line
- transfer badge if transfer

Actions:

- tap to detail
- edit
- delete with confirmation

## Email Import Review UI

List candidate cards:

- Merchant
- Amount
- Date
- Account hint
- Suggested category
- Confidence
- Duplicate warning

Actions:

- Accept
- Edit & accept
- Ignore
- Mark duplicate

Bulk actions desktop:

- Accept selected high-confidence items
- Ignore selected

Mobile:

- One card at a time review option
- Big Accept/Edit/Ignore buttons

## AI Categorizer UI

For uncategorized transaction:

- Show suggested category chip
- Confidence indicator
- Reason text
- Accept button
- Change category button

Confidence display:

- High: green
- Medium: yellow
- Low: gray

Never auto-apply low-confidence suggestion.

## Reports UI

Report controls:

- Month selector
- Date range selector
- Account filter
- Category filter

Report sections:

- Overview cards
- Income vs expense chart
- Category breakdown
- Budget variance list
- Account balances
- MoM trend
- AI advice

Mobile report:

- Cards stacked vertically
- Charts scroll horizontally only when needed
- Summary first, detail after

## Accessibility

- Tap target minimum 44px
- Good contrast
- Keyboard navigation on desktop
- Visible focus styles
- Labels on all inputs
- Error messages next to fields
- Currency values readable by screen readers

## Formatting

Currency:

- Display IDR as `Rp12.500`
- No decimal cents for IDR display
- Store Decimal per schema

Dates:

- Use Jakarta timezone display
- Default date input to today
- Reports grouped by local month

## Empty States

Dashboard:

- Prompt user to add first account and first transaction.

Transactions:

- Show Add Transaction button.

Email imports:

- Explain no finance emails found or no import configured.

Reports:

- Show need for transactions in selected period.

---

## UI Library Decisions

## Decisions

| Layer | Choice | Why |
|---|---|---|
| CSS | **Tailwind CSS** | Utility-first, fast prototyping, small bundle, works with Next.js out of box |
| Components | **shadcn/ui** | Copy-paste components, full control, accessible, built on Radix primitives |
| Charts | **Recharts** | React-native, good responsive support, simple API |
| Forms | **React Hook Form + Zod resolver** | Performant, minimal re-renders, Zod schema reuse from API |
| Icons | **Lucide React** | Consistent style, tree-shakeable, small bundle |
| Date picker | **react-day-picker** | Accessible, works with shadcn/ui calendar component |
| Toast/notifications | **Sonner** | Lightweight, beautiful, works with shadcn/ui toast |
| Tables | **TanStack Table** | Headless, powerful sorting/filtering/pagination, works with shadcn/ui data-table |

## Tailwind Setup

Already standard with Next.js. Additional config:

```js
// tailwind.config.ts
const config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Finance-specific semantic colors
        income: { DEFAULT: '#22c55e', light: '#bbf7d0', dark: '#166534' },
        expense: { DEFAULT: '#ef4444', light: '#fecaca', dark: '#991b1b' },
        transfer: { DEFAULT: '#3b82f6', light: '#bfdbfe', dark: '#1e40af' },
        budget: {
          under: '#22c55e',
          near: '#eab308',
          over: '#ef4444',
        },
      },
      screens: {
        'xs': '375px',   // small phones
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
};
```

## shadcn/ui Components to Install

Core:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add toast
npx shadcn@latest add sonner
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add table
npx shadcn@latest add scroll-area
npx shadcn@latest add command
npx shadcn@latest add calendar
npx shadcn@latest add data-table
npx shadcn@latest add form
```

Custom components to build on top:

- `BottomNav` — mobile bottom navigation
- `SidebarNav` — desktop sidebar
- `FloatingAddButton` — FAB for transaction entry
- `AmountInput` — numeric keypad with IDR formatting
- `CategoryPicker` — category tree selector with chips
- `AccountPicker` — account selector with balance preview
- `TransactionCard` — mobile transaction display
- `StatCard` — dashboard metric card
- `BudgetBar` — budget progress bar
- `ConfidenceBadge` — AI confidence indicator
- `MonthSelector` — month/year picker

## Recharts Usage

```tsx
// Category breakdown donut
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

<PieChart>
  <Pie data={categories} dataKey="amount" nameKey="name" />
  <Tooltip formatter={(v) => formatIDR(v)} />
</PieChart>

// Monthly trend line
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<LineChart data={monthlyData}>
  <Line type="monotone" dataKey="income" stroke="#22c55e" />
  <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
  <XAxis dataKey="month" />
  <YAxis tickFormatter={formatIDRShort} />
</LineChart>
```

Responsive strategy:

- Charts use `ResponsiveContainer` with 100% width
- On mobile: simpler charts, fewer labels
- On desktop: full charts with legend

## Form Pattern

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  account_id: z.string().uuid('Select an account'),
  category_id: z.string().uuid().optional(),
  date: z.date(),
  notes: z.string().max(500).optional(),
});

function TransactionForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      notes: '',
    },
  });
  
  // Reuse same Zod schema on client and server
}
```

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| xs | 375px+ | Mobile (bottom nav, cards, floating button) |
| md | 768px+ | Tablet (wider cards, some tables) |
| lg | 1024px+ | Desktop (sidebar nav, full tables, charts) |

## Component File Structure

```
src/components/
  ui/              ← shadcn/ui primitives (button, input, card, etc.)
  layout/
    sidebar-nav.tsx
    bottom-nav.tsx
    app-shell.tsx
    header.tsx
  transaction/
    transaction-form.tsx
    transaction-card.tsx
    transaction-list.tsx
    transaction-filters.tsx
    amount-input.tsx
    category-picker.tsx
    account-picker.tsx
    floating-add-button.tsx
    transfer-form.tsx
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
    extract-preview.tsx
  shared/
    month-selector.tsx
    empty-state.tsx
    loading-skeleton.tsx
    error-boundary.tsx
    confirm-dialog.tsx
```

## Dark Mode

Support via Tailwind `darkMode: 'class'`. Store preference in localStorage. Default to system preference.

## Accessibility Checklist

- All shadcn/ui components are accessible by default (Radix primitives)
- Custom components must pass axe-core audit
- Color contrast ≥ 4.5:1 for text
- Focus rings visible on all interactive elements
- Skip-to-content link on every page
- Amount input has `inputmode="numeric"` on mobile
- All charts have accessible text alternatives

---

## State and Data Fetching Strategy

## Decisions

| Concern | Choice | Why |
|---|---|---|
| Server data fetching | **TanStack Query (React Query v5)** | Caching, background refetch, mutations, optimistic updates |
| Client global state | **Zustand** | Tiny bundle, simple API, no providers needed |
| Form state | **React Hook Form** | Already decided in UI library |
| URL state (filters, pagination) | **nuqs** (Next.js URL search params) | Filters persist in URL, shareable, back-button works |

## Why Not SWR

SWR is simpler but TanStack Query gives us:

- Built-in mutation support with optimistic updates
- Better TypeScript support
- Query invalidation by tags
- Prefetching support
- DevTools

## TanStack Query Setup

```typescript
// src/lib/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 seconds before refetch
      gcTime: 5 * 60_000,       // 5 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Query Keys Convention

Use arrays for structured keys:

```typescript
const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    list: (filters: AccountFilters) => ['accounts', 'list', filters] as const,
    detail: (id: string) => ['accounts', 'detail', id] as const,
    balance: (id: string) => ['accounts', 'balance', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
    uncategorized: (filters?: any) => ['transactions', 'uncategorized', filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    tree: ['categories', 'tree'] as const,
  },
  budgets: {
    all: ['budgets'] as const,
    list: (period: string) => ['budgets', 'list', period] as const,
    progress: (period: string) => ['budgets', 'progress', period] as const,
  },
  reports: {
    monthly: (month: string) => ['reports', 'monthly', month] as const,
    cashflow: (range: DateRange) => ['reports', 'cashflow', range] as const,
    categories: (range: DateRange) => ['reports', 'categories', range] as const,
    trend: ['reports', 'trend'] as const,
  },
  email: {
    imports: (status?: string) => ['email', 'imports', status] as const,
  },
  dashboard: {
    summary: (month: string) => ['dashboard', 'summary', month] as const,
  },
};
```

## Custom Hooks

```typescript
// src/hooks/use-accounts.ts
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => fetch('/api/accounts').then(r => r.json()),
  });
}

export function useAccountBalance(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.balance(id),
    queryFn: () => fetch(`/api/accounts/${id}/balance`).then(r => r.json()),
  });
}

// src/hooks/use-transactions.ts
export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters as any);
      return fetch(`/api/transactions?${params}`).then(r => r.json());
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => {
        if (!r.ok) throw new Error('Failed to create');
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransferInput) =>
      fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => {
        if (!r.ok) throw new Error('Failed to create transfer');
        return r.json();
      }),
    onMutate: async (data) => {
      // Optimistic update: immediately show new balance
      await queryClient.cancelQueries({ queryKey: ['accounts'] });
      const previous = queryClient.getQueryData(queryKeys.accounts.all);
      
      // Optimistically update balances
      queryClient.setQueryData(queryKeys.accounts.all, (old: any) => {
        if (!old) return old;
        return old.map((acc: any) => {
          if (acc.id === data.source_account_id) {
            return { ...acc, balance: acc.balance - data.amount };
          }
          if (acc.id === data.destination_account_id) {
            return { ...acc, balance: acc.balance + data.amount };
          }
          return acc;
        });
      });
      
      return { previous };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKeys.accounts.all, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

## Optimistic Updates

Use optimistic updates for:

- Creating transactions (add to list immediately)
- Creating transfers (update balances immediately)
- Deleting transactions (remove from list immediately)
- Accepting AI category (update category chip immediately)

Do NOT use optimistic updates for:

- Creating accounts (user needs to see it confirmed)
- Budget changes (affects report calculations)
- Monthly summary generation (too complex)

## URL State with nuqs

```typescript
// src/hooks/use-transaction-filters.ts
import { useQueryState, parseAsString, parseAsInteger, parseAsIsoDate } from 'nuqs';

export function useTransactionFilters() {
  const [accountId, setAccountId] = useQueryState('account', parseAsString);
  const [categoryId, setCategoryId] = useQueryState('category', parseAsString);
  const [type, setType] = useQueryState('type', parseAsString);
  const [startDate, setStartDate] = useQueryState('from', parseAsIsoDate);
  const [endDate, setEndDate] = useQueryState('to', parseAsIsoDate);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState('q', parseAsString);
  
  return {
    filters: { accountId, categoryId, type, startDate, endDate, page, search },
    setAccountId, setCategoryId, setType, setStartDate, setEndDate, setPage, setSearch,
  };
}
```

Benefits:

- Filters persist in URL
- Back button works correctly
- Shareable links (though single-user, useful for debugging)
- No global state needed for filters

## Zustand Stores

Only for truly global client state that doesn't belong in URL:

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  addTransactionOpen: boolean;
  addTransactionType: 'expense' | 'income' | 'transfer';
  selectedMonth: string;  // YYYY-MM format
  
  setSidebarOpen: (open: boolean) => void;
  openAddTransaction: (type?: 'expense' | 'income' | 'transfer') => void;
  closeAddTransaction: () => void;
  setSelectedMonth: (month: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  addTransactionOpen: false,
  addTransactionType: 'expense',
  selectedMonth: new Date().toISOString().slice(0, 7),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openAddTransaction: (type = 'expense') => set({ 
    addTransactionOpen: true, 
    addTransactionType: type 
  }),
  closeAddTransaction: () => set({ addTransactionOpen: false }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
}));

// src/stores/recent-store.ts
interface RecentState {
  recentAccountIds: string[];
  recentCategoryIds: string[];
  
  addRecentAccount: (id: string) => void;
  addRecentCategory: (id: string) => void;
}

export const useRecentStore = create<RecentState>((set) => ({
  recentAccountIds: [],
  recentCategoryIds: [],
  
  addRecentAccount: (id) => set((state) => ({
    recentAccountIds: [id, ...state.recentAccountIds.filter(x => x !== id)].slice(0, 5),
  })),
  addRecentCategory: (id) => set((state) => ({
    recentCategoryIds: [id, ...state.recentCategoryIds.filter(x => x !== id)].slice(0, 5),
  })),
}));
```

Persist recent stores to localStorage using Zustand persist middleware.

## Loading Patterns

### Page Load

```tsx
function TransactionsPage() {
  const { filters } = useTransactionFilters();
  const { data, isLoading, error } = useTransactions(filters);
  
  if (isLoading) return <TransactionListSkeleton />;
  if (error) return <ErrorRetry onRetry={() => refetch()} />;
  if (!data?.items.length) return <EmptyState />;
  
  return <TransactionList items={data.items} />;
}
```

### Skeleton Pattern

Every page has a matching skeleton:

- `TransactionListSkeleton` — 5 placeholder cards
- `DashboardSkeleton` — placeholder stat cards + chart area
- `ReportSkeleton` — placeholder cards + chart area
- `AccountListSkeleton` — 3 placeholder account cards

### Error Boundary

```tsx
// src/components/shared/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

## Data Flow Summary

```
User Action → React Hook Form (form state)
            → Zod validation (client)
            → TanStack Query mutation (API call)
            → Server: Zod validation → Prisma → DB
            → Response → TanStack Query cache update
            → Invalidate related queries
            → UI re-renders with fresh data
```

---

## PWA Implementation

## Goal

App installs as a home-screen app on mobile. Works offline for viewing cached data. Queues transaction entries made offline for sync when back online.

## Manifest

```json
{
  "name": "Financial Tracker",
  "short_name": "FinTrack",
  "description": "Personal finance tracker",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#09090b",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Place at `public/manifest.webmanifest`. Link in layout:

```tsx
// src/app/layout.tsx
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#09090b" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

## Service Worker

Use **Serwist** (successor to Workbox, works with Next.js App Router).

```bash
npm install serwist @serwist/next
```

### Caching Strategy

| Resource | Strategy | Reason |
|---|---|---|
| App shell (HTML, CSS, JS) | Stale-while-revalidate | Fast load, update in background |
| API data | Network-first with cache fallback | Show fresh data, fall back to cached when offline |
| Icons/images | Cache-first | Rarely change |
| Fonts | Cache-first | Never change |

### Service Worker Registration

```typescript
// src/app/sw.ts (Serwist entry point)
import { defaultCache } from '@serwist/next/worker';
import { PrecacheEntry, Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__WB_MANIFEST as PrecacheEntry[],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

### Offline Queue for Transactions

When offline, user can still add transactions. They queue in IndexedDB and sync when back online.

```typescript
// src/lib/offline-queue.ts
import { openDB } from 'idb';

const DB_NAME = 'fintrack-offline';
const STORE = 'pending-transactions';

interface PendingTransaction {
  id: string;
  endpoint: string;
  body: any;
  createdAt: number;
}

export async function queueTransaction(data: PendingTransaction) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' });
    },
  });
  await db.put(STORE, data);
}

export async function syncPendingTransactions() {
  const db = await openDB(DB_NAME, 1);
  const pending = await db.getAll(STORE);
  
  for (const item of pending) {
    try {
      const response = await fetch(item.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
      
      if (response.ok) {
        await db.delete(STORE, item.id);
      } else if (response.status < 500) {
        // Client error — remove (won't succeed on retry)
        await db.delete(STORE, item.id);
      }
      // Server error — keep for retry
    } catch {
      // Still offline — keep queued
      break;
    }
  }
}
```

Register sync in service worker:

```typescript
// On online event, flush queue
self.addEventListener('online', () => {
  syncPendingTransactions();
});
```

## Offline UI Indicators

```tsx
// src/components/shared/offline-indicator.tsx
'use client';

import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center text-sm py-1 z-50">
      You are offline. Transactions will sync when connected.
    </div>
  );
}
```

## Install Prompt

```tsx
// src/components/shared/install-prompt.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setShow(false);
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border rounded-lg p-4 shadow-lg z-40">
      <p className="text-sm font-medium mb-2">Install Financial Tracker</p>
      <p className="text-xs text-muted-foreground mb-3">
        Add to home screen for faster access and offline support.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInstall}>Install</Button>
        <Button size="sm" variant="ghost" onClick={() => setShow(false)}>Later</Button>
      </div>
    </div>
  );
}
```

## App Icons

Generate icons at these sizes:

- `public/icons/icon-192.png` — 192×192
- `public/icons/icon-512.png` — 512×512
- `public/icons/icon-maskable-512.png` — 512×512 with safe zone padding
- `public/favicon.ico` — 32×32

## Testing

- Test install on Chrome Android
- Test install on Safari iOS (add to home screen)
- Test offline: kill server, open app, add transaction, restore server, verify sync
- Lighthouse PWA audit ≥ 90

---

## Low Gaps: Dark Mode, Accessibility, i18n, Backup

## 22.1 Dark Mode

### Decision

Support dark mode from day one using Tailwind `darkMode: 'class'`.

### Implementation

- Store preference in localStorage: `fintrack-theme` = `light` | `dark` | `system`
- Default to `system` (follow OS preference)
- Apply class to `<html>` element
- All shadcn/ui components support dark mode automatically

### Theme Provider

```tsx
// src/components/providers/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'system', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('fintrack-theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('fintrack-theme', theme);
    
    const root = document.documentElement;
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Custom Color Tokens

Already defined in Tailwind config (doc 13). Additional dark-mode-specific colors:

- Cards: `bg-card` / `dark:bg-card` (shadcn handles this)
- Income green stays green in both modes
- Expense red stays red in both modes
- Chart colors work on both backgrounds

---

## 22.2 Data Export

### CSV Export

Export transactions as CSV for spreadsheet analysis.

**API:** `POST /api/settings/export/csv`

**Query params:** `startDate`, `endDate`, `accountId`, `categoryId`

**Output:**

```csv
Date,Account,Category,Type,Amount,Currency,Exchange Rate,Amount IDR,Notes,Transfer
2026-04-01,BCA,Salary,Income,15000000,IDR,1,15000000,April salary,No
2026-04-05,GoPay,Food & Drinks,Expense,55000,IDR,1,55000,Gojek food,No
2026-04-10,BCA,,Transfer,-500000,IDR,1,500000,Topup GoPay,Yes
```

**Implementation:**

```typescript
// src/lib/export/csv.ts
export function transactionsToCSV(transactions: TransactionExportRow[]): string {
  const headers = ['Date', 'Account', 'Category', 'Type', 'Amount', 'Currency', 'Exchange Rate', 'Amount IDR', 'Notes', 'Transfer'];
  
  const rows = transactions.map(t => [
    t.date,
    t.accountName,
    t.categoryName || '',
    t.type === 'debit' ? (t.categoryType === 'INCOME' ? 'Income' : 'Deposit') : (t.categoryType === 'EXPENSE' ? 'Expense' : 'Withdrawal'),
    t.amount,
    t.currency,
    t.exchangeRate,
    t.amountIdr,
    (t.notes || '').replace(/"/g, '""'),
    t.isTransfer ? 'Yes' : 'No',
  ]);

  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}
```

### JSON Backup

Full data export for backup/restore.

**API:** `POST /api/settings/export/json`

**Output:**

```json
{
  "version": 1,
  "exportedAt": "2026-04-18T10:00:00+07:00",
  "accounts": [...],
  "categories": [...],
  "transactions": [...],
  "budgets": [...],
  "monthlySummaries": [...],
  "settings": [...]
}
```

**Note:** Excludes audit logs (too large, system-generated). Excludes soft-deleted records by default. Optional `includeDeleted` param.

### CSV Import

Import transactions from other apps.

**API:** `POST /api/settings/import/csv`

**Flow:**

1. User uploads CSV
2. App parses headers and shows column mapping UI
3. User maps: Date column, Amount column, Account column, Category column, Notes column
4. App shows preview of first 5 rows
5. User confirms
6. App creates transactions with validation
7. Report: X imported, Y skipped (duplicates), Z errors

**Required columns:** Date, Amount
**Optional columns:** Account, Category, Notes, Currency

---

## 22.3 Category Tree Depth Limits

### Rules

- Maximum depth: **2 levels** (parent → child)
- No cycles: validate `parent_category_id` doesn't create circular reference
- Categories without parent = top level
- Categories with parent = second level
- Third level children rejected with validation error

### Validation

```typescript
// In category creation/update Zod schema
const CategorySchema = z.object({
  name: z.string().min(1).max(100),
  parent_category_id: z.string().uuid().optional().nullable(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER_FEE']),
}).refine(async (data) => {
  if (!data.parent_category_id) return true;
  
  // Parent must exist and must be top-level (no grandparent)
  const parent = await prisma.category.findUnique({
    where: { id: data.parent_category_id, deleted_at: null },
  });
  
  if (!parent) return false;
  if (parent.parent_category_id) return false; // Would create 3rd level
  
  return true;
}, { message: 'Parent category invalid (max 2 levels deep)' });
```

### Cycle Prevention

```typescript
// Additional check: parent can't be self or descendant
if (data.parent_category_id === categoryId) {
  throw new Error('Category cannot be its own parent');
}
// At 2 levels max, only need to check self-reference
```

### Tree Query

```typescript
async function getCategoryTree() {
  const categories = await prisma.category.findMany({
    where: { deleted_at: null },
    orderBy: { name: 'asc' },
  });

  const topLevel = categories.filter(c => !c.parent_category_id);
  
  return topLevel.map(parent => ({
    ...parent,
    children: categories.filter(c => c.parent_category_id === parent.id),
  }));
}
```

### UI Display

```
INCOME
├── Salary
├── Freelance
├── Bonus
├── Gift
└── Other Income

EXPENSE
├── Food & Drinks
│   ├── Restaurant
│   └── Coffee
├── Transport
│   ├── Ride-hailing
│   └── Fuel
├── Rent
├── Utilities
└── ...
```

Mobile: flat list with indentation. Desktop: collapsible tree.

---

## 22.4 Backup and Restore Procedure

### Automated Backup

pg_dump runs daily via Docker cron.

```dockerfile
# docker-compose.yml
services:
  backup:
    image: postgres:16-alpine
    volumes:
      - ./backups:/backups
    environment:
      DATABASE_URL: postgresql://user:***@db:5432/fintrack
    entrypoint: |
      sh -c 'while true; do
        pg_dump $$DATABASE_URL --format=custom --file=/backups/backup-$$(date +%Y%m%d-%H%M%S).dump
        find /backups -name "*.dump" -mtime +30 -delete
        sleep 86400
      done'
```

### Backup Retention

| Period | Retention |
|---|---|
| Daily backups | Last 30 days |
| Weekly backups | Last 12 weeks (keep Monday's backup) |
| Monthly backups | Last 12 months (keep 1st of month) |

### Backup Storage

- Local: `./backups/` directory on VPS
- Optional: sync to object storage (Oracle Object Storage) weekly

### Restore Procedure

```bash
# Stop app
docker compose stop app

# Restore from backup
docker compose exec db pg_restore \
  --dbname=fintrack \
  --clean \
  --if-exists \
  /backups/backup-20260418-030000.dump

# Restart app
docker compose start app

# Run migrations if schema changed
docker compose exec app npx prisma migrate deploy
```

### Backup Verification

Monthly: test restore on a separate database to verify backup integrity.

```bash
# Create test DB
docker compose exec db createdb fintrack_test

# Restore latest backup
docker compose exec db pg_restore --dbname=fintrack_test /backups/latest.dump

# Check record counts
docker compose exec db psql fintrack_test -c "SELECT COUNT(*) FROM \"Transaction\" WHERE deleted_at IS NULL;"

# Drop test DB
docker compose exec db dropdb fintrack_test
```

---

## 22.5 Accessibility Audit Plan

### Requirements

All pages must pass:

- WCAG 2.1 Level AA
- axe-core automated audit with 0 critical violations

### Testing Tools

| Tool | Purpose | When |
|---|---|---|
| axe-core (Playwright) | Automated a11y testing | CI on every PR |
| Lighthouse a11y audit | Overall score | Before release |
| Manual keyboard navigation | Tab order, focus management | Manual QA |
| Screen reader test | NVDA or VoiceOver | Manual QA |

### Playwright Integration

```typescript
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dashboard has no accessibility violations', async ({ page }) => {
  await page.goto('/dashboard');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});

test('add transaction form is accessible', async ({ page }) => {
  await page.goto('/transactions/new');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `N` | New transaction |
| `G` then `D` | Go to Dashboard |
| `G` then `T` | Go to Transactions |
| `G` then `R` | Go to Reports |
| `/` | Focus search |
| `?` | Show keyboard shortcuts |
| `Esc` | Close modal/sheet |

### Color Contrast

All text meets 4.5:1 contrast ratio against background. Verified via Tailwind colors and Lighthouse audit.

### Screen Reader

- All amounts announced as "Rp fifty-five thousand" not "R p fifty-five dot zero zero zero"
- Charts have text alternatives via `aria-label`
- Form errors announced via `aria-describedby`
- Navigation landmarks: `<nav>`, `<main>`, `<aside>`

---

## 22.6 Internationalization (i18n)

### Decision

**No i18n framework.** Single user in Jakarta. Hardcode English UI with Indonesian number/date formatting.

### Number Formatting

```typescript
// src/lib/utils/format.ts

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIDRShort(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`;
  return amount.toString();
}

export function formatNumber(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(amount);
}
```

### Date Formatting

```typescript
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}

export function formatMonthYear(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}
```

### UI Language

- UI labels in English (Dashboard, Transactions, Reports, etc.)
- AI advice can be in English or Indonesian (user preference in settings later)
- Error messages in English
- Toast messages in English

### If i18n needed later

Use `next-intl` — lightweight, works with App Router. But not needed for single-user.
