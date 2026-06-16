import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { createTransactionSchema, updateTransactionSchema } from "@/lib/validators";
import type { TransactionWithRelations } from "@/types";
import type { CursorPaginatedResponse } from "@/types/api";
import { apiData, apiFetch, jsonRequest, toSearchParams } from "./api-client";
import { queryKeys, type TransactionFilters } from "./query-keys";

type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

function invalidateMoney(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
  queryClient.invalidateQueries({ queryKey: ["reports"] });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => apiFetch<CursorPaginatedResponse<TransactionWithRelations>>(`/api/transactions?${toSearchParams(filters)}`),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: () => apiData<TransactionWithRelations>(`/api/transactions/${id}`),
    enabled: Boolean(id),
  });
}

export function useUncategorizedTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.uncategorized,
    queryFn: () => apiData<TransactionWithRelations[]>("/api/transactions/uncategorized"),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      apiData<TransactionWithRelations>("/api/transactions", jsonRequest("POST", data)),
    onSuccess: () => invalidateMoney(queryClient),
  });
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTransactionInput) =>
      apiData<TransactionWithRelations>(`/api/transactions/${id}`, jsonRequest("PATCH", data)),
    onSuccess: () => {
      invalidateMoney(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(id) });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiData<{ success: boolean }>(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateMoney(queryClient),
  });
}
