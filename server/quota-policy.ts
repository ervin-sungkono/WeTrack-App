export type QuotaState = { windowStart: number; count: number };
export type QuotaPolicy = { limit: number; windowMs: number };

export class QuotaExceededError extends Error {
  readonly status = 429;
  constructor(readonly retryAfter: number) {
    super('Too many requests');
    this.name = 'QuotaExceededError';
  }
}

/** Fixed windows let the persistent store retain only one document per scope. */
export function advanceQuota(previous: unknown, now: number, policy: QuotaPolicy): QuotaState {
  if (!Number.isInteger(policy.limit) || policy.limit < 1 || !Number.isFinite(policy.windowMs) || policy.windowMs <= 0) {
    throw new Error('Invalid quota configuration');
  }
  const windowStart = Math.floor(now / policy.windowMs) * policy.windowMs;
  const record = previous && typeof previous === 'object' ? previous as Record<string, unknown> : {};
  const count = record.windowStart === windowStart
    && typeof record.count === 'number'
    && Number.isSafeInteger(record.count)
    && record.count >= 0 ? record.count : 0;
  if (count >= policy.limit) {
    throw new QuotaExceededError(Math.max(1, Math.ceil((windowStart + policy.windowMs - now) / 1000)));
  }
  return { windowStart, count: count + 1 };
}
