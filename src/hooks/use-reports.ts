import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AIAdvice, MonthlySummaryPayload } from "@/types";
import { apiData, toSearchParams } from "./api-client";
import { queryKeys, type DateRange } from "./query-keys";

export type ReportRow = Record<string, unknown>;

export function useMonthlyReport(month: string) {
  return useQuery({
    queryKey: queryKeys.reports.monthly(month),
    queryFn: () => apiData<MonthlySummaryPayload>(`/api/reports/monthly?month=${month}`),
    enabled: Boolean(month),
  });
}

export function useCashflowReport(range: DateRange = {}) {
  return useQuery({
    queryKey: queryKeys.reports.cashflow(range),
    queryFn: () => apiData<ReportRow[]>(`/api/reports/cashflow?${toSearchParams(range)}`),
  });
}

export function useCategoryReport(range: DateRange = {}) {
  return useQuery({
    queryKey: queryKeys.reports.categories(range),
    queryFn: () => apiData<ReportRow[]>(`/api/reports/categories?${toSearchParams(range)}`),
  });
}

export function useBudgetReport(range: DateRange = {}) {
  return useQuery({
    queryKey: queryKeys.reports.budgets(range),
    queryFn: () => apiData<ReportRow[]>(`/api/reports/budgets?${toSearchParams(range)}`),
  });
}

export function useAccountReport() {
  return useQuery({
    queryKey: queryKeys.reports.accounts,
    queryFn: () => apiData<ReportRow[]>("/api/reports/accounts"),
  });
}

export function useMonthlySummaryAdvice(month: string) {
  return useQuery({
    queryKey: queryKeys.reports.monthlySummaryAdvice(month),
    queryFn: () => apiData<AIAdvice>(`/api/reports/monthly-summary/advise?month=${month}`),
    enabled: Boolean(month),
  });
}

export function useRunMonthlySummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (month: string) => apiData<MonthlySummaryPayload>(`/api/reports/monthly-summary/run?month=${month}`, { method: "POST" }),
    onSuccess: (_data, month) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.monthly(month) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.monthlySummaryAdvice(month) });
    },
  });
}
