"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionForm } from "./transaction-form"
import type {
  TransactionCategoryOption,
  TransactionFormValues,
  TransactionOption,
  TransactionSubmitValues,
} from "./types"

type TransactionDialogProps = {
  open?: boolean
  title?: string
  description?: string
  accounts: TransactionOption[]
  categories?: TransactionCategoryOption[]
  defaultValues?: Partial<TransactionFormValues>
  submitLabel?: string
  isSubmitting?: boolean
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  onSubmit?: (values: TransactionSubmitValues) => void | Promise<void>
}

export function TransactionDialog({
  open,
  title = "New transaction",
  description = "Record income or expense for selected account.",
  accounts,
  categories,
  defaultValues,
  submitLabel,
  isSubmitting,
  trigger,
  onOpenChange,
  onSubmit = async () => {},
}: TransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const controlled = open !== undefined
  const dialogOpen = controlled ? open : internalOpen
  const setDialogOpen = onOpenChange ?? setInternalOpen

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          onCancel={() => setDialogOpen(false)}
          onSubmit={async (values) => {
            await onSubmit?.(values)
            setDialogOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
