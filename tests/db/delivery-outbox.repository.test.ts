import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import {
  enqueueDeliveryEvent,
  getOutboxEvent,
  listPendingOutboxEvents,
  markOutboxAttemptStarted,
  markOutboxDelivered,
  markOutboxFailed,
  markOutboxSkipped,
  requestOutboxRetry,
  recoverStaleOutboxAttempts
} from '../../src/lib/db/repositories/delivery-outbox';

describe('delivery outbox repository', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('enqueues idempotently and only lists due events', async () => {
    const due = await enqueueDeliveryEvent(db, {
      provider: 'meta',
      eventName: 'QualifiedLead',
      dedupeKey: 'lead:1:qualified',
      payload: { leadId: 1 },
      nextAttemptAt: new Date('2026-08-10T10:00:00Z')
    });
    const retry = await enqueueDeliveryEvent(db, {
      provider: 'meta',
      eventName: 'QualifiedLead',
      dedupeKey: 'lead:1:qualified',
      payload: { leadId: 999 }
    });
    await enqueueDeliveryEvent(db, {
      provider: 'google',
      eventName: 'generate_lead',
      dedupeKey: 'lead:2:new',
      payload: {},
      nextAttemptAt: new Date('2026-08-12T10:00:00Z')
    });

    expect(due).toEqual({ id: 1, created: true });
    expect(retry).toEqual({ id: 1, created: false });
    const pending = await listPendingOutboxEvents(db, {
      now: new Date('2026-08-11T10:00:00Z')
    });
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].payloadJson)).toEqual({ leadId: 1 });
  });

  it('guards an attempt claim and supports retry then delivery', async () => {
    const { id } = await enqueueDeliveryEvent(db, {
      provider: 'google',
      eventName: 'purchase',
      dedupeKey: 'lead:1:completed',
      payload: { value: 250 },
      nextAttemptAt: new Date('2026-08-10T09:00:00Z')
    });
    const attemptAt = new Date('2026-08-10T10:00:00Z');
    expect(await markOutboxAttemptStarted(db, id, attemptAt)).toBe(true);
    expect(await markOutboxAttemptStarted(db, id, attemptAt)).toBe(false);
    expect(await getOutboxEvent(db, id)).toMatchObject({
      status: 'processing',
      attemptCount: 1
    });

    const retryAt = new Date('2026-08-10T10:05:00Z');
    await markOutboxFailed(db, id, { error: 'temporary outage', nextAttemptAt: retryAt });
    expect(await listPendingOutboxEvents(db, { now: new Date('2026-08-10T10:04:59Z') })).toEqual([]);
    expect(await listPendingOutboxEvents(db, { now: retryAt })).toHaveLength(1);
    expect(await markOutboxAttemptStarted(db, id, retryAt)).toBe(true);
    await markOutboxDelivered(db, id, new Date('2026-08-10T10:06:00Z'));
    expect(await getOutboxEvent(db, id)).toMatchObject({
      status: 'sent',
      attemptCount: 2,
      lastError: ''
    });
  });

  it('recovers an abandoned processing attempt after its lease expires', async () => {
    const { id } = await enqueueDeliveryEvent(db, {
      provider: 'meta',
      eventName: 'Lead',
      dedupeKey: 'lead:9:new',
      payload: {},
      nextAttemptAt: new Date('2026-08-10T09:00:00Z')
    });
    await markOutboxAttemptStarted(db, id, new Date('2026-08-10T10:00:00Z'));

    await expect(recoverStaleOutboxAttempts(db, {
      staleBefore: new Date('2026-08-10T09:59:59Z')
    })).resolves.toEqual([]);
    await expect(recoverStaleOutboxAttempts(db, {
      staleBefore: new Date('2026-08-10T10:00:00Z'),
      nextAttemptAt: new Date('2026-08-10T10:10:00Z')
    })).resolves.toEqual([id]);
    expect(await getOutboxEvent(db, id)).toMatchObject({
      status: 'failed',
      lastError: 'Attempt lease expired'
    });
  });

  it('guards manual retries and records provider skips separately from delivery', async () => {
    const { id } = await enqueueDeliveryEvent(db, {
      provider: 'google', eventName: 'qualified', dedupeKey: 'lead:18:qualified', payload: {}
    });
    expect(await requestOutboxRetry(db, id)).toBe(true);
    expect(await markOutboxAttemptStarted(db, id)).toBe(true);
    expect(await requestOutboxRetry(db, id)).toBe(false);
    await markOutboxSkipped(db, id, 'consent_denied');
    expect(await getOutboxEvent(db, id)).toMatchObject({ status: 'skipped', lastError: 'consent_denied' });
    expect(await requestOutboxRetry(db, id)).toBe(false);
  });
});
