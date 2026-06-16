import { z } from 'zod';

export const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('IDR'),
  exchange_rate: z.coerce.number().positive().default(1),
  type: z.enum(['debit', 'credit']),
  category_id: z.string().uuid().optional().nullable(),
  date: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const createTransferSchema = z.object({
  source_account_id: z.string().uuid(),
  destination_account_id: z.string().uuid(),
  amount: z.coerce.number().positive('Amount must be positive'),
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

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']),
  normal_balance: z.enum(['debit', 'credit']),
  currency: z.string().default('IDR'),
});

export const updateAccountSchema = createAccountSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER_FEE']).default('EXPENSE'),
  parent_category_id: z.string().uuid().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  period: z.string().default('monthly'),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const createRecurringSchema = z.object({
  name: z.string().min(1).max(100),
  account_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().default('IDR'),
  type: z.enum(['debit', 'credit']),
  category_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  day_of_month: z.number().int().min(1).max(28).optional().nullable(),
  next_due: z.coerce.date(),
});

export const updateRecurringSchema = createRecurringSchema.partial();

export const emailParseSchema = z.object({
  provider_message_id: z.string().optional(),
  sender: z.string(),
  subject: z.string(),
  received_at: z.coerce.date(),
  snippet: z.string().max(5000),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const reportFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});
