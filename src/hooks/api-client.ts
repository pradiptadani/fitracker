import type { ApiResponse } from "@/types/api";

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function apiData<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const payload = await apiFetch<ApiResponse<T>>(input, init);
  return payload.data;
}

export function jsonRequest(method: "POST" | "PATCH", data: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export function toSearchParams(values: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  return params;
}
