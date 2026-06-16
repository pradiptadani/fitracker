import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { createBudgetSchema, updateBudgetSchema } from "@/lib/validators";
import type { BudgetWithProgress } from "@/types";
import { apiData, jsonRequest } from "./api-client";
import { queryKeys } from "./query-keys";

type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets.all,
    queryFn: () => apiData<BudgetWithProgress[]>("/api/budgets"),
  });
}

export function useBudgetProgress(month: string) {
  return useQuery({
    queryKey: queryKeys.budgets.progress(month),
    queryFn: () => apiData<BudgetWithProgress[]>(`/api/budgets/progress?month=${month}`),
    enabled: Boolean(month),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetInput) => apiData<BudgetWithProgress>("/api/budgets", jsonRequest("POST", data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateBudget(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBudgetInput) => apiData<BudgetWithProgress>(`/api/budgets/${id}`, jsonRequest("PATCH", data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiData<{ success: boolean }>(`/api/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
