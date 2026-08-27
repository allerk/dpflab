import { describe, expect, it, vi } from 'vitest';
import { ingestMetaLead } from '../../src/lib/db/repositories/meta-leads';

vi.mock('../../src/lib/db/repositories/contact-submissions', () => ({
  createCrmLead: vi.fn(async (_db, input) => ({ id: 41, created: input.externalLeadId !== 'duplicate' })),
  recordLeadActivity: vi.fn(async () => 1)
}));

describe('Meta lead repository mapping', () => {
  it('maps Estonian displayed answers to canonical CRM values', async () => {
    const { createCrmLead } = await import('../../src/lib/db/repositories/contact-submissions');
    await ingestMetaLead({} as never, {
      provider: 'meta',
      source: 'meta_instant_form',
      idempotencyKey: 'meta:lead:12345',
      externalLeadId: '12345',
      pageId: '54321',
      formId: '67890',
      createdAt: '2026-08-10T12:00:00.000Z',
      receivedAt: '2026-08-10T12:00:01.000Z',
      isOrganic: false,
      fullName: 'Mari',
      phone: '+3725555555',
      serviceType: 'DPF puhastus',
      filterState: 'Juba eemaldatud',
      clientType: 'Auto omanik',
      registrationNumber: '123 abc',
      urgency: '1–3 päeva jooksul',
      standardFields: {},
      customFields: {}
    });

    expect(createCrmLead).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        origin: 'meta_instant',
        source: 'meta_paid',
        locale: 'et',
        serviceType: 'dpf',
        filterState: 'removed',
        clientType: 'private',
        registrationNumber: '123 abc',
        urgency: 'days_1_3'
      })
    );
  });

  it('also accepts option keys returned by Meta', async () => {
    const { createCrmLead } = await import('../../src/lib/db/repositories/contact-submissions');
    await ingestMetaLead({} as never, {
      provider: 'meta',
      source: 'meta_instant_form',
      idempotencyKey: 'meta:lead:22345',
      externalLeadId: '22345',
      pageId: '54321',
      formId: '67890',
      createdAt: '2026-08-10T12:00:00.000Z',
      receivedAt: '2026-08-10T12:00:01.000Z',
      serviceType: 'catalyst',
      filterState: 'installed',
      clientType: 'fleet',
      urgency: 'week',
      standardFields: {},
      customFields: {}
    });

    expect(createCrmLead).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        serviceType: 'catalyst',
        filterState: 'installed',
        clientType: 'fleet',
        urgency: 'this_week'
      })
    );
  });
});
