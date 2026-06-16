const calls: Record<string, number[]> = {};
const MAX_CALLS = 5;
const WINDOW_MS = 300_000; // 5 minutes

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();

  if (!calls[identifier]) {
    calls[identifier] = [];
  }

  // Remove calls older than window
  while (calls[identifier].length > 0 && calls[identifier][0] < now - WINDOW_MS) {
    calls[identifier].shift();
  }

  if (calls[identifier].length >= MAX_CALLS) {
    const retryAfterMs = WINDOW_MS - (now - (calls[identifier][0] ?? 0));
    return { allowed: false, retryAfterMs };
  }

  calls[identifier].push(now);
  return { allowed: true, retryAfterMs: 0 };
}
