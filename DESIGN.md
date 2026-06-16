# Design System — Financial Tracker

Visual language for consistent UI across desktop and mobile.

---

## Color Palette

### Semantic Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--income` | `#22c55e` (green-500) | `#4ade80` (green-400) | Income amounts, income category badges |
| `--expense` | `#ef4444` (red-500) | `#f87171` (red-400) | Expense amounts, expense category badges |
| `--transfer` | `#3b82f6` (blue-500) | `#60a5fa` (blue-400) | Transfer badges, transfer indicators |
| `--budget-under` | `#22c55e` | `#4ade80` | Budget progress < 80% |
| `--budget-near` | `#eab308` (yellow-500) | `#facc15` (yellow-400) | Budget progress 80–100% |
| `--budget-over` | `#ef4444` | `#f87171` | Budget progress > 100% |

### AI Confidence Colors

| Level | Color | Background |
|---|---|---|
| High (>0.7) | `#22c55e` | `bg-green-100 dark:bg-green-900/30` |
| Medium (0.4–0.7) | `#eab308` | `bg-yellow-100 dark:bg-yellow-900/30` |
| Low (<0.4) | `#6b7280` | `bg-gray-100 dark:bg-gray-900/30` |

### shadcn/ui Theme Tokens

```css
/* Light mode */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

/* Dark mode */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

---

## Typography

```css
/* Font stack */
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;

/* Scale */
text-xs    → 0.75rem  / 1rem    → captions, badges
text-sm    → 0.875rem / 1.25rem → body secondary, form labels
text-base  → 1rem     / 1.5rem  → body primary
text-lg    → 1.125rem / 1.75rem → card titles
text-xl    → 1.25rem  / 1.75rem → section headers
text-2xl   → 1.5rem   / 2rem    → page titles
text-3xl   → 1.875rem / 2.25rem → stat numbers (large)
text-4xl   → 2.25rem  / 2.5rem  → hero amounts (dashboard)
```

### Amount Display Rules

| Context | Style | Example |
|---|---|---|
| Stat card (dashboard) | `text-3xl font-bold tabular-nums` | Rp15.000.000 |
| Transaction list | `text-base font-semibold tabular-nums` | Rp55.000 |
| Transaction detail | `text-2xl font-bold tabular-nums` | Rp55.000 |
| Chart tooltip | `text-sm font-medium` | Rp55.000 |
| Short form (sidebar) | `text-sm text-muted-foreground` | 15.0jt |
| Budget bar label | `text-xs text-muted-foreground` | 2.5jt / 3jt |

Always use `tabular-nums` for monetary amounts to align digits.

---

## Spacing & Layout

### Breakpoints

| Name | Width | Layout |
|---|---|---|
| `xs` | 375px | Small phones — bottom nav, single column, full-width cards |
| `sm` | 640px | Large phones — same as xs, slightly wider cards |
| `md` | 768px | Tablet — bottom nav or sidebar, 2-column grids possible |
| `lg` | 1024px | Desktop — sidebar nav, tables, multi-column dashboards |
| `xl` | 1280px | Wide desktop — max content width, wider tables |

### Container

```css
/* Main content area */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `gap-1` / `p-1` | 4px | Inline badges, tight padding |
| `gap-2` / `p-2` | 8px | Card internal padding, chip gaps |
| `gap-3` / `p-3` | 12px | Form field spacing |
| `gap-4` / `p-4` | 16px | Card padding, section gaps |
| `gap-6` / `p-6` | 24px | Section separation, page padding |
| `gap-8` / `p-8` | 32px | Major section breaks |

---

## Component Patterns

### Stat Card

```
┌────────────────────────┐
│ label (text-sm muted)   │
│ Rp15.000.000 (text-3xl) │
│ ↑ 12% from last month  │  ← optional delta
└────────────────────────┘
```

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold tabular-nums">{formatIDR(amount)}</div>
    {delta && <p className="text-xs text-muted-foreground mt-1">{delta}</p>}
  </CardContent>
</Card>
```

### Transaction Card (Mobile)

```
┌────────────────────────────────┐
│ 🍜 Food & Drinks       -55.000 │
│    GoPay · 18 Apr · Gojek food │
└────────────────────────────────┘
```

```tsx
<div className="flex items-center justify-between p-4 border-b">
  <div className="flex items-center gap-3">
    <span className="text-lg">{categoryIcon}</span>
    <div>
      <p className="font-medium">{categoryName}</p>
      <p className="text-sm text-muted-foreground">{accountName} · {date}</p>
    </div>
  </div>
  <span className={cn("font-semibold tabular-nums", isExpense ? "text-red-500" : "text-green-500")}>
    {isExpense ? "-" : "+"}{formatIDR(amount)}
  </span>
</div>
```

### Transaction Row (Desktop Table)

| Date | Account | Category | Notes | Amount |
|---|---|---|---|---|
| 18 Apr | GoPay | 🍜 Food & Drinks | Gojek food | -Rp55.000 |
| 17 Apr | BCA | 💰 Salary | April salary | +Rp15.000.000 |

### Budget Progress Bar

```
Food & Drinks
████████░░ Rp2.500.000 / Rp3.000.000 (83%)
```

```tsx
<div>
  <div className="flex justify-between text-sm mb-1">
    <span>{categoryName}</span>
    <span className="tabular-nums text-muted-foreground">{formatIDR(actual)} / {formatIDR(budget)}</span>
  </div>
  <Progress value={percent} className={cn(
    percent > 100 ? "[&>div]:bg-red-500" :
    percent > 80 ? "[&>div]:bg-yellow-500" :
    "[&>div]:bg-green-500"
  )} />
</div>
```

### Category Chip

```tsx
<Badge variant="secondary" className="gap-1">
  <span>{icon}</span>
  <span>{name}</span>
</Badge>
```

### Transfer Badge

```tsx
<Badge variant="outline" className="border-blue-300 text-blue-600">
  <ArrowLeftRight className="w-3 h-3 mr-1" />
  Transfer
</Badge>
```

### AI Confidence Badge

```tsx
<Badge className={cn(
  confidence > 0.7 ? "bg-green-100 text-green-800" :
  confidence > 0.4 ? "bg-yellow-100 text-yellow-800" :
  "bg-gray-100 text-gray-600"
)}>
  {confidence > 0.7 ? "High" : confidence > 0.4 ? "Medium" : "Low"} ({Math.round(confidence * 100)}%)
</Badge>
```

---

## Layout Patterns

### Desktop App Shell

```
┌────────────┬─────────────────────────────────────────┐
│            │  Header (h-16, border-b)                │
│  Sidebar   │  ┌───────────────────────────────────┐  │
│  (w-64)    │  │  Page Content                     │  │
│            │  │  (p-6, max-w-7xl)                  │  │
│  Nav items │  │                                    │  │
│  + icons   │  │                                    │  │
│            │  │                                    │  │
│            │  └───────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────┘
```

### Mobile App Shell

```
┌────────────────────────┐
│ Header (h-14)          │
├────────────────────────┤
│                        │
│ Page Content           │
│ (p-4, pb-24 for nav)   │
│                        │
│                        │
│              [+] FAB   │
├────────────────────────┤
│ [🏠] [📋] [ ] [📊] [⋯] │  ← Bottom nav (h-16)
└────────────────────────┘
```

### Responsive Strategy

- `< md`: Bottom nav, single column, cards, FAB
- `≥ md`: Sidebar nav, tables, no FAB (Add button in header)
- Dashboard grid: 1 col mobile → 2 col tablet → 4 col desktop

---

## Icon Mapping (Lucide)

| Context | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Transactions | `Receipt` |
| Accounts | `Wallet` |
| Categories | `Tags` |
| Budgets | `Target` |
| Recurring | `Repeat` |
| Reports | `BarChart3` |
| Email Imports | `Mail` |
| Settings | `Settings` |
| Add transaction | `Plus` (in circle) |
| Income | `ArrowDownLeft` (green) |
| Expense | `ArrowUpRight` (red) |
| Transfer | `ArrowLeftRight` (blue) |
| Delete | `Trash2` |
| Edit | `Pencil` |
| Search | `Search` |
| Filter | `Filter` |
| Calendar | `Calendar` |
| AI suggestion | `Sparkles` |
| Offline | `WifiOff` |
| Success | `CheckCircle2` |
| Error | `AlertCircle` |
| Warning | `AlertTriangle` |
| Loading | `Loader2` (animate-spin) |
| Empty state | `Inbox` |

---

## Category Icons (Emoji)

| Category | Emoji |
|---|---|
| Salary | 💰 |
| Freelance | 💼 |
| Bonus | 🎁 |
| Food & Drinks | 🍜 |
| Groceries | 🛒 |
| Transport | 🚗 |
| Rent | 🏠 |
| Utilities | 💡 |
| Internet & Phone | 📱 |
| Health | 🏥 |
| Shopping | 🛍️ |
| Entertainment | 🎬 |
| Subscription | 📺 |
| Family | 👨‍👩‍👧 |
| Education | 📚 |
| Travel | ✈️ |
| Bank Fees | 🏦 |
| Transfer Fees | 💸 |
| Other | 📌 |

---

## Animation

| Element | Animation | Duration |
|---|---|---|
| Page transition | `fade-in` | 150ms |
| Modal/sheet open | `slide-up` (mobile) / `fade-in` (desktop) | 200ms |
| Toast | `slide-in-right` | 300ms |
| Skeleton pulse | `animate-pulse` | infinite |
| Loading spinner | `animate-spin` | infinite |
| FAB press | `scale-95` | 100ms |
| Card hover | `shadow-md → shadow-lg` | 200ms |

Use Tailwind `transition-all duration-200` as default.

---

## Empty States

Every empty list/card should show:

1. Icon (muted, 48px)
2. Title (text-lg font-medium)
3. Description (text-sm text-muted-foreground)
4. Primary action button

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium">No transactions yet</h3>
  <p className="text-sm text-muted-foreground mt-1 mb-4">Start tracking by adding your first transaction.</p>
  <Button onClick={onAdd}>Add Transaction</Button>
</div>
```

---

## Loading Skeletons

Every page has a matching skeleton using shadcn `Skeleton`:

- **Dashboard:** 4 stat card skeletons + chart area skeleton + 5 transaction row skeletons
- **Transaction list:** 8 transaction card skeletons
- **Reports:** 2 chart skeletons + stat skeletons
- **Account list:** 3 account card skeletons

```tsx
// Example: Transaction card skeleton
<div className="flex items-center justify-between p-4 border-b">
  <div className="flex items-center gap-3">
    <Skeleton className="w-8 h-8 rounded-full" />
    <div>
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
  <Skeleton className="h-5 w-20" />
</div>
```
