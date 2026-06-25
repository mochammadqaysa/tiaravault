/**
 * Simple in-memory rate limiter.
 * In a real-world multi-instance production environment,
 * you would use Redis (e.g. Upstash) or Memcached.
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = store.get(identifier);

  // Clean up expired records periodically (every 5 minutes) to avoid memory leaks
  if (Math.random() < 0.05) {
    for (const [key, val] of store.entries()) {
      if (val.resetTime < now) {
        store.delete(key);
      }
    }
  }

  if (!record) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  // If the window has expired, reset it
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, remaining: limit - 1, resetTime: record.resetTime };
  }

  // Increment count
  record.count += 1;

  if (record.count > limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
