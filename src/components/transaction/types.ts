export type TransactionType = "debit" | "credit"

export type TransactionOption = {
  id: string
  name: string
}

export type TransactionCategoryOption = TransactionOption & {
  type?: "INCOME" | "EXPENSE" | "TRANSFER_FEE"
}

export type TransactionFormValues = {
  accountId: string
  amount: number
  currency: string
  exchangeRate: number
  type: TransactionType
  categoryId?: string
  date: string
  notes?: string
}

export type TransactionSubmitValues = Omit<
  TransactionFormValues,
  "categoryId" | "notes"
> & {
  categoryId: string | null
  notes: string | null
}

export const DEFAULT_TRANSACTION_VALUES: TransactionFormValues = {
  accountId: "",
  amount: 0,
  currency: "IDR",
  exchangeRate: 1,
  type: "debit",
  categoryId: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
}
