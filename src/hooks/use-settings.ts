import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiData, jsonRequest } from "./api-client";
import { queryKeys } from "./query-keys";

export type SettingsMap = Record<string, unknown>;
export type UpdateSettingInput = { key: string; value: unknown };

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => apiData<SettingsMap>("/api/settings"),
  });
}

export function useSetting<T = unknown>(key: string) {
  const query = useSettings();
  return {
    ...query,
    data: query.data?.[key] as T | undefined,
  };
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingInput) => apiData<UpdateSettingInput>("/api/settings", jsonRequest("POST", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.all }),
  });
}
