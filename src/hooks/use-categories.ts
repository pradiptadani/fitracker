import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { createCategorySchema, updateCategorySchema } from "@/lib/validators";
import type { CategoryType, CategoryWithChildren } from "@/types";
import { apiData, jsonRequest } from "./api-client";
import { queryKeys } from "./query-keys";

type Category = Omit<CategoryWithChildren, "children">;
type CreateCategoryInput = z.infer<typeof createCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => apiData<Category[]>("/api/categories"),
  });
}

export function useCategoriesByType(type?: CategoryType) {
  const query = useCategories();
  return {
    ...query,
    data: type ? query.data?.filter((category) => category.type === type) : query.data,
  };
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => apiData<Category>("/api/categories", jsonRequest("POST", data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryInput) => apiData<Category>(`/api/categories/${id}`, jsonRequest("PATCH", data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiData<{ success: boolean }>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
