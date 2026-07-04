// Per-user in-memory rate limiter for Bedrock routes.
// Serverless caveat: each Vercel function instance has its own map, so this is a
// per-instance limit, not a global one. Acceptable stopgap before a Redis/Upstash
// solution is added. With 30 req/hour the limit is generous enough that splitting
// across a handful of warm instances won't cause real pain for honest users.

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CALLS = 30;

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = store.get(userId);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(userId, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= MAX_CALLS) {
    const retryAfterSecs = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSecs };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}
