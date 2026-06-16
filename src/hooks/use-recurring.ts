import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { createRecurringSchema, updateRecurringSchema } from "@/lib/validators";
import type { RecurringTransactionRow, TransactionWithRelations } from "@/types";
import { apiData, jsonRequest } from "./api-client";
import { queryKeys } from "./query-keys";

type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;

export function useRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurring.all,
    queryFn: () => apiData<RecurringTransactionRow[]>("/api/recurring"),
  });
}

export function useDueRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurring.due,
    queryFn: () => apiData<RecurringTransactionRow[]>("/api/recurring/due"),
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringInput) => apiData<RecurringTransactionRow>("/api/recurring", jsonRequest("POST", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all }),
  });
}

export function useUpdateRecurring(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRecurringInput) => apiData<RecurringTransactionRow>(`/api/recurring/${id}`, jsonRequest("PATCH", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all }),
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiData<{ success: boolean }>(`/api/recurring/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all }),
  });
}

export function useAcceptRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiData<TransactionWithRelations>(`/api/recurring/${id}/accept`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}
