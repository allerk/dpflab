import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contactSubmissions, leadActivities } from '../../src/lib/db/schema';
import {
  calculateSubmissionFinancials,
  createContactSubmission,
  createCrmLead,
  findPotentialDuplicateSubmissions,
  getContactSubmission,
  getSubmissionActivities,
  normalizeEmail,
  normalizePhone,
  updateLeadFinancials,
  updateLeadNextAction,
  type SubmissionInput
} from '../../src/lib/db/repositories/contact-submissions';

const siteSubmission = (overrides: Partial<SubmissionInput> = {}): SubmissionInput => ({
  name: 'Alice',
  phone: '+372 5555-5014',
  email: ' ALICE@Example.COM ',
  clientType: 'private',
  serviceType: 'dpf',
  filterState: 'removed',
  vehicle: 'VW Passat',
  urgency: 'days_1_3',
  preferredContact: 'phone',
  privacyVersion: '2026-07-23',
  locale: 'ru',
  ...overrides
});

describe('CRM lead persistence', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('normalizes contacts and stores Google attribution without changing the site API', async () => {
    const id = await createContactSubmission(db, siteSubmission({
      filterState: 'installed',
      gclid: 'google-click',
      gbraid: 'gbraid-1',
      wbraid: 'wbraid-1',
      gaClientId: '123.456',
      gaSessionId: '789'
    }));

    await expect(getContactSubmission(db, id)).resolves.toMatchObject({
      origin: 'site',
      source: 'google',
      phoneNormalized: '+37255555014',
      emailNormalized: 'alice@example.com',
      gclid: 'google-click',
      gbraid: 'gbraid-1',
      wbraid: 'wbraid-1',
      gaClientId: '123.456',
      gaSessionId: '789',
      partnerPaymentModel: 'customer_direct'
    });
    expect(normalizePhone('00372 5555 5014')).toBe('+37255555014');
    expect(normalizePhone('37255555014')).toBe('+37255555014');
    expect(normalizePhone('55555014')).toBe('+37255555014');
    expect(normalizeEmail(' Alice@EXAMPLE.com ')).toBe('alice@example.com');
  });

  it('imports external leads idempotently by origin and external lead id', async () => {
    const input = {
      origin: 'meta_instant' as const,
      externalLeadId: 'lead-123',
      externalFormId: 'form-456',
      source: 'facebook',
      name: 'Meta lead',
      phone: '+372 5000 0000',
      locale: 'et'
    };
    const first = await createCrmLead(db, input);
    const retry = await createCrmLead(db, { ...input, name: 'Webhook retry' });

    expect(first).toEqual({ id: 1, created: true });
    expect(retry).toEqual({ id: 1, created: false });
    await expect(getContactSubmission(db, first.id)).resolves.toMatchObject({
      name: 'Meta lead',
      externalFormId: 'form-456'
    });
    const activities = await db.select().from(leadActivities);
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({ activityType: 'lead_created', toValue: 'meta_instant' });
  });

  it('finds potential duplicates through normalized phone or email', async () => {
    const firstId = await createContactSubmission(db, siteSubmission());
    await createContactSubmission(db, siteSubmission({
      name: 'Bob',
      phone: '00372 5555 5014',
      email: 'bob@example.com'
    }));

    const byPhone = await findPotentialDuplicateSubmissions(db, {
      normalizedPhone: '+37255555014',
      excludeId: firstId
    });
    const byEmail = await findPotentialDuplicateSubmissions(db, {
      normalizedEmail: 'alice@example.com'
    });
    expect(byPhone.map((row) => row.name)).toEqual(['Bob']);
    expect(byEmail.map((row) => row.name)).toEqual(['Alice']);
  });

  it('keeps the legacy deal-cost API readable for backwards compatibility', async () => {
    const id = await createContactSubmission(db, siteSubmission());
    await updateLeadFinancials(db, id, {
      orderAmountCents: 25_000,
      partsMaterialsCostCents: 4_500,
      laborCostCents: 6_000,
      logisticsCostCents: 1_500,
      otherCostCents: 500,
      actor: 'Egor'
    });
    const nextActionAt = new Date('2026-08-12T09:30:00Z');
    await updateLeadNextAction(db, id, {
      nextActionAt,
      nextActionNote: 'Call after diagnostics',
      actor: 'Egor'
    });

    const row = await getContactSubmission(db, id);
    expect(row).toMatchObject({
      orderAmountCents: 25_000,
      partsMaterialsCostCents: 4_500,
      laborCostCents: 6_000,
      logisticsCostCents: 1_500,
      otherCostCents: 500,
      nextActionNote: 'Call after diagnostics'
    });
    expect(row?.nextActionAt?.toISOString()).toBe(nextActionAt.toISOString());
    expect(calculateSubmissionFinancials(row!)).toEqual({
      revenueCents: 25_000,
      totalCostCents: 12_500,
      grossProfitCents: 12_500
    });
    const activities = await getSubmissionActivities(db, id);
    expect(activities.map((activity) => activity.activityType)).toEqual([
      'next_action_updated',
      'financials_updated',
      'lead_created'
    ]);
  });

  it('allows repeated empty external IDs for ordinary site leads', async () => {
    await db.insert(contactSubmissions).values([
      { name: 'A', phone: '+1', locale: 'ru', createdAt: new Date() },
      { name: 'B', phone: '+2', locale: 'ru', createdAt: new Date() }
    ]);
    const rows = await db.select().from(contactSubmissions);
    expect(rows).toHaveLength(2);
  });
});
