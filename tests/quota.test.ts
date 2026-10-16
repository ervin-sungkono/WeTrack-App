import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceQuota, QuotaExceededError } from '../server/quota-policy';

const policy = { limit: 2, windowMs: 60_000 };

test('AI quota enforces the budget and supplies a finite retry delay', () => {
  const first = advanceQuota(undefined, 65_000, policy);
  const second = advanceQuota(first, 66_000, policy);
  assert.equal(second.count, 2);
  assert.throws(() => advanceQuota(second, 67_000, policy), (error: unknown) => {
    return error instanceof QuotaExceededError && error.status === 429 && error.retryAfter === 53;
  });
});

test('AI quota resets at the next window without relying on a cleanup job', () => {
  assert.deepEqual(advanceQuota({ windowStart: 60_000, count: 2 }, 120_000, policy), {
    windowStart: 120_000, count: 1,
  });
});

test('invalid persisted counters cannot create a negative or unlimited budget', () => {
  for (const count of [-5, NaN, Infinity, 1.5, '1']) {
    assert.equal(advanceQuota({ windowStart: 60_000, count }, 65_000, policy).count, 1);
  }
});
