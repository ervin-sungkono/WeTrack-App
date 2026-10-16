import 'server-only';
import { createHash } from 'node:crypto';
import { db } from './db';
import { advanceQuota, type QuotaPolicy } from './quota-policy';

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Shared by AI routes; Firestore transactions coordinate concurrent instances. */
export async function consumeAiQuota(userId: string): Promise<void> {
  const policies: Array<QuotaPolicy & { name: string }> = [
    { name: 'minute', limit: positiveInteger(process.env.AI_REQUESTS_PER_MINUTE, 6), windowMs: 60_000 },
    { name: 'day', limit: positiveInteger(process.env.AI_REQUESTS_PER_DAY, 60), windowMs: 86_400_000 },
  ];
  const uidHash = createHash('sha256').update(userId).digest('hex');
  const references = policies.map(({ name }) => db.collection('rateLimits').doc(`ai_${uidHash}_${name}`));
  await db.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);
    const now = Date.now();
    const nextStates = snapshots.map((snapshot, index) => advanceQuota(snapshot.data(), now, policies[index]));
    references.forEach((reference, index) => {
      transaction.set(reference, nextStates[index]);
    });
  });
}
