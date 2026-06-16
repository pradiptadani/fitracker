const calls: number[] = [];
const MAX_CALLS = 20;
const WINDOW_MS = 60_000; // 1 minute

export function checkRateLimit(): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  // Remove calls older than window
  while (calls.length > 0 && calls[0] < now - WINDOW_MS) calls.shift();

  if (calls.length >= MAX_CALLS) {
    const retryAfterMs = WINDOW_MS - (now - (calls[0] ?? 0));
    return { allowed: false, retryAfterMs };
  }
  calls.push(now);
  return { allowed: true, retryAfterMs: 0 };
}
