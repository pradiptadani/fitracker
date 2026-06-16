"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TransactionDialog } from "./transaction-dialog"
import type { TransactionCategoryOption, TransactionOption, TransactionSubmitValues } from "./types"

type NewTransactionDialogProps = {
  accounts: TransactionOption[]
  categories: TransactionCategoryOption[]
}

export function NewTransactionDialog({ accounts, categories }: NewTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: TransactionSubmitValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to create transaction")

      toast.success("Transaction created")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Could not create transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New transaction
      </Button>
      <TransactionDialog
        open={open}
        accounts={accounts}
        categories={categories}
        isSubmitting={isSubmitting}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
      />
    </>
  )
}
