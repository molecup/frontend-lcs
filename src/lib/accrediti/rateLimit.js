const limiterStore = new Map();

export const hitRateLimit = ({ key, limit = 5, windowMs = 60_000 }) => {
  const now = Date.now();
  const entry = limiterStore.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    limiterStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  limiterStore.set(key, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
};

