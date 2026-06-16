export type DateRange = {
  startDate?: string;
  endDate?: string;
};

export type TransactionFilters = {
  account?: string;
  category?: string;
  from?: string;
  to?: string;
  q?: string;
  transfers?: boolean;
  limit?: number;
  cursor?: string;
};

export const queryKeys = {
  accounts: {
    all: ["accounts"] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
    balance: (id: string) => ["accounts", "balance", id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters?: TransactionFilters) => ["transactions", "list", filters] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
    uncategorized: ["transactions", "uncategorized"] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    progress: (month: string) => ["budgets", "progress", month] as const,
  },
  reports: {
    monthly: (month: string) => ["reports", "monthly", month] as const,
    cashflow: (range: DateRange) => ["reports", "cashflow", range] as const,
    categories: (range: DateRange) => ["reports", "categories", range] as const,
    budgets: (range: DateRange) => ["reports", "budgets", range] as const,
    accounts: ["reports", "accounts"] as const,
    monthlySummaryAdvice: (month: string) => ["reports", "monthly-summary", "advise", month] as const,
  },
  recurring: {
    all: ["recurring"] as const,
    due: ["recurring", "due"] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
};
