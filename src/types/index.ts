export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type NormalBalance = 'debit' | 'credit';
export type TransactionType = 'debit' | 'credit';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER_FEE';

export interface AccountWithBalance {
  id: string;
  name: string;
  type: AccountType;
  normal_balance: NormalBalance;
  currency: string;
  balance: number; // computed, never stored
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

export interface BudgetWithProgress {
  id: string;
  category_id: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
  category: { id: string; name: string; type: CategoryType };
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

export interface RecurringTransactionRow {
  id: string;
  name: string;
  account_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category_id: string | null;
  notes: string | null;
  frequency: string;
  day_of_month: number | null;
  last_generated: string | null;
  next_due: string;
  active: boolean;
  account: { id: string; name: string };
  category: { id: string; name: string; type: CategoryType } | null;
}
