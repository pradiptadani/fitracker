/* eslint-disable react-hooks/incompatible-library --
   react-hook-form triggers this rule on React 19; the library still works. */
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  DEFAULT_TRANSACTION_VALUES,
  type TransactionCategoryOption,
  type TransactionFormValues,
  type TransactionOption,
  type TransactionSubmitValues,
} from "./types"
import { TemplateChips } from "./template-chips"

const transactionFormSchema = z.object({
  accountId: z.string().min(1, "Account required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().trim().min(3, "Currency required").max(3, "Use 3-letter code"),
  exchangeRate: z.coerce
    .number()
    .positive("Exchange rate must be greater than 0"),
  type: z.enum(["debit", "credit"]),
  categoryId: z.string().optional(),
  date: z.string().min(1, "Date required"),
  notes: z.string().max(500, "Notes max 500 characters").optional(),
})

type TransactionFormProps = {
  accounts: TransactionOption[]
  categories?: TransactionCategoryOption[]
  defaultValues?: Partial<TransactionFormValues>
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  className?: string
  onSubmit: (values: TransactionSubmitValues) => void | Promise<void>
  onCancel?: () => void
}

export function TransactionForm({
  accounts,
  categories = [],
  defaultValues,
  submitLabel = "Save transaction",
  cancelLabel = "Cancel",
  isSubmitting = false,
  className,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema) as Resolver<
      TransactionFormValues,
      unknown,
      TransactionFormValues
    >,
    defaultValues: {
      ...DEFAULT_TRANSACTION_VALUES,
      ...defaultValues,
    },
  })

  const type = form.watch("type")
  const filteredCategories = categories.filter(
    (category) =>
      !category.type ||
      category.type === "TRANSFER_FEE" ||
      (type === "credit" && category.type === "INCOME") ||
      (type === "debit" && category.type === "EXPENSE")
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      currency: values.currency.toUpperCase(),
      categoryId: values.categoryId || null,
      notes: values.notes?.trim() || null,
    })
  })

  return (
    <Form {...form}>
      <form className={cn("space-y-5", className)} onSubmit={handleSubmit}>
        <TemplateChips />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className={cn(
                      field.value !== "debit" &&
                        "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => field.onChange("debit")}
                  >
                    Expense
                  </Button>
                  <Button
                    type="button"
                    className={cn(
                      field.value !== "credit" &&
                        "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => field.onChange("credit")}
                  >
                    Income
                  </Button>
                </div>
              </FormControl>
              <FormDescription>Debit = money out. Credit = money in.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" min="0" step="0.01" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="date" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select disabled={!accounts.length} onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input
                    maxLength={3}
                    placeholder="IDR"
                    {...field}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exchangeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange rate</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" min="0" step="0.000001" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional notes"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button
              className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              disabled={isSubmitting}
              type="button"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { transactionFormSchema, TemplateChips }
