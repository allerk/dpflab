import { beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({
  enqueueDeliveryEvent: vi.fn(),
  getOutboxEvent: vi.fn(),
  listPendingOutboxEvents: vi.fn(),
  markOutboxAttemptStarted: vi.fn(),
  markOutboxDelivered: vi.fn(),
  markOutboxFailed: vi.fn(),
  markOutboxSkipped: vi.fn(),
  recoverStaleOutboxAttempts: vi.fn()
}));
const contacts = vi.hoisted(() => ({ getContactSubmission: vi.fn(), getContactSubmissionsUpdatedSince: vi.fn() }));
const google = vi.hoisted(() => ({ sendGoogleCrmEvent: vi.fn() }));
const meta = vi.hoisted(() => ({ sendMetaCrmEvent: vi.fn() }));

vi.mock('$lib/db/repositories/delivery-outbox', () => repository);
vi.mock('$lib/db/repositories/contact-submissions', () => contacts);
vi.mock('$lib/server/analytics/google-ga4', () => google);
vi.mock('$lib/server/analytics/meta-capi', () => meta);

import { enqueueCrmStageEvents, processCrmOutbox } from '../../src/lib/server/crm/outbox';

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  origin: 'site',
  analyticsConsent: true,
  externalLeadId: '',
  landingPage: 'https://dpflab.ee/',
  name: 'Test', phone: '+37255555014', email: '', locale: 'ru', serviceType: 'dpf',
  fbp: '', fbc: '', gaClientId: '123.456', gaSessionId: '789', source: 'meta',
  orderAmountCents: 20_000,
  ...overrides
}) as never;

beforeEach(() => {
  vi.clearAllMocks();
  repository.enqueueDeliveryEvent
    .mockResolvedValueOnce({ id: 1, created: true })
    .mockResolvedValueOnce({ id: 2, created: true });
  repository.recoverStaleOutboxAttempts.mockResolvedValue([]);
});

describe('CRM delivery outbox orchestration', () => {
  it('queues only Google lead_created but both providers for a consented site milestone', async () => {
    await expect(enqueueCrmStageEvents({} as never, row(), 'lead_created')).resolves.toEqual([1]);
    expect(repository.enqueueDeliveryEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ provider: 'google', dedupeKey: 'submission:7:lead_created' })
    );

    repository.enqueueDeliveryEvent.mockReset()
      .mockResolvedValueOnce({ id: 3, created: true })
      .mockResolvedValueOnce({ id: 4, created: true });
    await expect(enqueueCrmStageEvents({} as never, row(), 'qualified')).resolves.toEqual([3, 4]);
    expect(repository.enqueueDeliveryEvent.mock.calls.map((call) => call[1].provider)).toEqual(['google', 'meta']);
  });

  it('queues Meta CRM feedback for an Instant Form without website analytics consent', async () => {
    await expect(
      enqueueCrmStageEvents(
        {} as never,
        row({ origin: 'meta_instant', analyticsConsent: false }),
        'booked'
      )
    ).resolves.toEqual([1]);
    expect(repository.enqueueDeliveryEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ provider: 'meta', eventName: 'booked' })
    );
  });

  it('acknowledges a delivered Google row', async () => {
    repository.listPendingOutboxEvents.mockResolvedValue([{
      id: 11, submissionId: 7, provider: 'google', eventName: 'qualified',
      payloadJson: JSON.stringify({ stage: 'qualified', occurredAt: new Date().toISOString() }),
      attemptCount: 0
    }]);
    repository.markOutboxAttemptStarted.mockResolvedValue(true);
    contacts.getContactSubmission.mockResolvedValue(row());
    google.sendGoogleCrmEvent.mockResolvedValue({ outcome: 'delivered', acknowledge: true, httpStatus: 204 });

    await expect(processCrmOutbox({} as never, {})).resolves.toEqual({ delivered: 1, deferred: 0, failed: 0, skipped: 0 });
    expect(repository.markOutboxDelivered).toHaveBeenCalledWith(expect.anything(), 11);
  });

  it('keeps policy-gated Meta feedback retryable', async () => {
    repository.listPendingOutboxEvents.mockResolvedValue([{
      id: 12, submissionId: 7, provider: 'meta', eventName: 'booked',
      payloadJson: JSON.stringify({ stage: 'booked', occurredAt: new Date().toISOString() }),
      attemptCount: 1
    }]);
    repository.markOutboxAttemptStarted.mockResolvedValue(true);
    contacts.getContactSubmission.mockResolvedValue(row({ origin: 'meta_instant', analyticsConsent: false, externalLeadId: '123456' }));
    meta.sendMetaCrmEvent.mockResolvedValue({ outcome: 'deferred', acknowledge: false, reason: 'policy_not_enabled' });

    await expect(processCrmOutbox({} as never, {})).resolves.toEqual({ delivered: 0, deferred: 1, failed: 0, skipped: 0 });
    expect(repository.markOutboxFailed).toHaveBeenCalledWith(
      expect.anything(),
      12,
      expect.objectContaining({ error: 'policy_not_enabled', dead: false })
    );
  });

  it('loads a targeted retry by exact id instead of filtering the first page', async () => {
    repository.getOutboxEvent.mockResolvedValue({
      id: 99, submissionId: 7, provider: 'google', eventName: 'qualified',
      status: 'failed', nextAttemptAt: new Date(0),
      payloadJson: JSON.stringify({ stage: 'qualified', occurredAt: new Date().toISOString() }),
      attemptCount: 1
    });
    repository.markOutboxAttemptStarted.mockResolvedValue(true);
    contacts.getContactSubmission.mockResolvedValue(row());
    google.sendGoogleCrmEvent.mockResolvedValue({ outcome: 'skipped', acknowledge: true, reason: 'consent_denied' });

    await expect(processCrmOutbox({} as never, {}, { onlyId: 99 })).resolves.toEqual({
      delivered: 0, deferred: 0, failed: 0, skipped: 1
    });
    expect(repository.listPendingOutboxEvents).not.toHaveBeenCalled();
    expect(repository.markOutboxSkipped).toHaveBeenCalledWith(expect.anything(), 99, 'consent_denied');
  });
});
