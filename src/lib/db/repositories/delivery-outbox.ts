import { and, asc, desc, eq, inArray, lte, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { deliveryOutbox } from '../schema';

export const DELIVERY_PROVIDERS = ['meta', 'google'] as const;
export type DeliveryProvider = (typeof DELIVERY_PROVIDERS)[number];
export type DeliveryOutboxRow = typeof deliveryOutbox.$inferSelect;

export type EnqueueDeliveryEventInput = {
  submissionId?: number | null;
  provider: DeliveryProvider;
  eventName: string;
  dedupeKey: string;
  payload: unknown;
  nextAttemptAt?: Date;
};

export async function enqueueDeliveryEvent(
  db: Db,
  input: EnqueueDeliveryEventInput
): Promise<{ id: number; created: boolean }> {
  const now = new Date();
  const [created] = await db
    .insert(deliveryOutbox)
    .values({
      submissionId: input.submissionId ?? null,
      provider: input.provider,
      eventName: input.eventName,
      dedupeKey: input.dedupeKey,
      payloadJson: JSON.stringify(input.payload),
      status: 'pending',
      nextAttemptAt: input.nextAttemptAt ?? now,
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoNothing()
    .returning({ id: deliveryOutbox.id });
  if (created) return { id: created.id, created: true };

  const [existing] = await db
    .select({ id: deliveryOutbox.id })
    .from(deliveryOutbox)
    .where(
      and(
        eq(deliveryOutbox.provider, input.provider),
        eq(deliveryOutbox.dedupeKey, input.dedupeKey)
      )
    );
  if (!existing) throw new Error('Delivery outbox conflict could not be resolved');
  return { id: existing.id, created: false };
}

export async function listPendingOutboxEvents(
  db: Db,
  input: { provider?: DeliveryProvider; now?: Date; limit?: number } = {}
): Promise<DeliveryOutboxRow[]> {
  const dueAt = input.now ?? new Date();
  const due = and(
    inArray(deliveryOutbox.status, ['pending', 'failed']),
    lte(deliveryOutbox.nextAttemptAt, dueAt),
    input.provider ? eq(deliveryOutbox.provider, input.provider) : undefined
  );
  return db
    .select()
    .from(deliveryOutbox)
    .where(due)
    .orderBy(asc(deliveryOutbox.nextAttemptAt), asc(deliveryOutbox.id))
    .limit(Math.min(Math.max(input.limit ?? 50, 1), 500));
}

/**
 * Claims a due row for an attempt. The guarded update prevents two workers from
 * claiming the same pending event at the same time.
 */
export async function markOutboxAttemptStarted(
  db: Db,
  id: number,
  attemptedAt = new Date()
): Promise<boolean> {
  const [claimed] = await db
    .update(deliveryOutbox)
    .set({
      status: 'processing',
      attemptCount: sql`${deliveryOutbox.attemptCount} + 1`,
      lastAttemptAt: attemptedAt,
      updatedAt: attemptedAt
    })
    .where(
      and(
        eq(deliveryOutbox.id, id),
        inArray(deliveryOutbox.status, ['pending', 'failed']),
        lte(deliveryOutbox.nextAttemptAt, attemptedAt)
      )
    )
    .returning({ id: deliveryOutbox.id });
  return Boolean(claimed);
}

export async function markOutboxDelivered(
  db: Db,
  id: number,
  deliveredAt = new Date()
): Promise<void> {
  await db
    .update(deliveryOutbox)
    .set({
      status: 'sent',
      sentAt: deliveredAt,
      lastError: '',
      updatedAt: deliveredAt
    })
    .where(and(eq(deliveryOutbox.id, id), eq(deliveryOutbox.status, 'processing')));
}

export async function markOutboxSkipped(
  db: Db,
  id: number,
  reason: string,
  skippedAt = new Date()
): Promise<void> {
  await db
    .update(deliveryOutbox)
    .set({
      status: 'skipped',
      lastError: reason.slice(0, 2_000),
      updatedAt: skippedAt
    })
    .where(and(eq(deliveryOutbox.id, id), eq(deliveryOutbox.status, 'processing')));
}

export async function markOutboxFailed(
  db: Db,
  id: number,
  input: { error: string; nextAttemptAt: Date; dead?: boolean; failedAt?: Date }
): Promise<void> {
  const failedAt = input.failedAt ?? new Date();
  await db
    .update(deliveryOutbox)
    .set({
      status: input.dead ? 'dead' : 'failed',
      nextAttemptAt: input.nextAttemptAt,
      lastError: input.error.slice(0, 2_000),
      updatedAt: failedAt
    })
    .where(and(eq(deliveryOutbox.id, id), eq(deliveryOutbox.status, 'processing')));
}

/** Makes a selected retryable row due now without overwriting sent/processing/dead state. */
export async function requestOutboxRetry(db: Db, id: number, now = new Date()): Promise<boolean> {
  const [updated] = await db
    .update(deliveryOutbox)
    .set({ status: 'failed', nextAttemptAt: now, lastError: 'manual_retry', updatedAt: now })
    .where(
      and(
        eq(deliveryOutbox.id, id),
        inArray(deliveryOutbox.status, ['pending', 'failed'])
      )
    )
    .returning({ id: deliveryOutbox.id });
  return Boolean(updated);
}

/** Returns abandoned processing rows to the retry queue after a worker crash. */
export async function recoverStaleOutboxAttempts(
  db: Db,
  input: { staleBefore: Date; nextAttemptAt?: Date; reason?: string }
): Promise<number[]> {
  const now = new Date();
  const rows = await db
    .update(deliveryOutbox)
    .set({
      status: 'failed',
      nextAttemptAt: input.nextAttemptAt ?? now,
      lastError: input.reason ?? 'Attempt lease expired',
      updatedAt: now
    })
    .where(
      and(
        eq(deliveryOutbox.status, 'processing'),
        lte(deliveryOutbox.lastAttemptAt, input.staleBefore)
      )
    )
    .returning({ id: deliveryOutbox.id });
  return rows.map((row) => row.id);
}

export async function getOutboxEvent(db: Db, id: number): Promise<DeliveryOutboxRow | undefined> {
  const [row] = await db
    .select()
    .from(deliveryOutbox)
    .where(eq(deliveryOutbox.id, id));
  return row;
}

export async function listOutboxEventsForSubmission(
  db: Db,
  submissionId: number,
  limit = 100
): Promise<DeliveryOutboxRow[]> {
  return db
    .select()
    .from(deliveryOutbox)
    .where(eq(deliveryOutbox.submissionId, submissionId))
    .orderBy(desc(deliveryOutbox.createdAt), desc(deliveryOutbox.id))
    .limit(Math.min(Math.max(limit, 1), 500));
}
