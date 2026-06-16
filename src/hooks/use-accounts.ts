import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { createAccountSchema, updateAccountSchema } from "@/lib/validators";
import type { AccountWithBalance } from "@/types";
import { apiData, jsonRequest } from "./api-client";
import { queryKeys } from "./query-keys";

type CreateAccountInput = z.infer<typeof createAccountSchema>;
type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => apiData<AccountWithBalance[]>("/api/accounts"),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => apiData<AccountWithBalance>(`/api/accounts/${id}`),
    enabled: Boolean(id),
  });
}

export function useAccountBalance(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.balance(id),
    queryFn: () => apiData<{ balance: number }>(`/api/accounts/${id}/balance`),
    enabled: Boolean(id),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountInput) =>
      apiData<AccountWithBalance>("/api/accounts", jsonRequest("POST", data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAccountInput) =>
      apiData<AccountWithBalance>(`/api/accounts/${id}`, jsonRequest("PATCH", data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiData<{ success: boolean }>(`/api/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
