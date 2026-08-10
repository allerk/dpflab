import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contactSubmissions } from '../../src/lib/db/schema';
import {
  getContactSubmissions,
  getCompletedSubmissionsForPeriod,
  getContactSubmissionsForPeriod,
  getContactSubmission,
  deleteContactSubmission,
  updateContactSubmissionPipeline,
  updateLeadOperations
} from '../../src/lib/db/repositories/contact-submissions';

describe('contact-submissions write functions', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('getContactSubmissions returns rows ordered by createdAt DESC', async () => {
    const t1 = new Date('2026-01-01T10:00:00Z');
    const t2 = new Date('2026-01-02T10:00:00Z');
    await db.insert(contactSubmissions).values([
      { name: 'Alice', phone: '+1', comment: '', locale: 'ru', createdAt: t1 },
      { name: 'Bob', phone: '+2', comment: '', locale: 'et', createdAt: t2 }
    ]);

    const rows = await getContactSubmissions(db);
    expect(rows[0].name).toBe('Bob');
    expect(rows[1].name).toBe('Alice');
  });

  it('loads an independent reporting cohort instead of reusing the UI page', async () => {
    await db.insert(contactSubmissions).values([
      { name: 'Old', phone: '+1', locale: 'ru', createdAt: new Date('2026-06-01T00:00:00Z') },
      { name: 'Recent', phone: '+2', locale: 'et', createdAt: new Date('2026-08-05T00:00:00Z') }
    ]);
    const rows = await getContactSubmissionsForPeriod(db, {
      from: new Date('2026-08-01T00:00:00Z'),
      to: new Date('2026-08-31T23:59:59Z')
    });
    expect(rows.map((row) => row.name)).toEqual(['Recent']);
  });

  it('returns the matching submission or undefined', async () => {
    await db.insert(contactSubmissions).values({
      name: 'Alice',
      phone: '+1',
      email: 'alice@example.com',
      comment: 'Full note',
      locale: 'ru',
      createdAt: new Date()
    });
    const [inserted] = await getContactSubmissions(db);

    await expect(getContactSubmission(db, inserted.id)).resolves.toMatchObject({
      id: inserted.id,
      comment: 'Full note'
    });
    await expect(getContactSubmission(db, 999_999)).resolves.toBeUndefined();
  });

  it('deleteContactSubmission removes the row', async () => {
    await db.insert(contactSubmissions).values({ name: 'X', phone: '+3', comment: '', locale: 'ru', createdAt: new Date() });
    const rows = await getContactSubmissions(db);
    await deleteContactSubmission(db, rows[0].id);

    const after = await getContactSubmissions(db);
    expect(after).toHaveLength(0);
  });

  it('updates the pipeline and records milestone timestamps once', async () => {
    await db.insert(contactSubmissions).values({
      name: 'Lead',
      phone: '+372 5555 5014',
      comment: '',
      locale: 'ru',
      createdAt: new Date()
    });
    const [created] = await getContactSubmissions(db);

    await updateContactSubmissionPipeline(db, created.id, {
      status: 'contacted',
      assignedTo: 'Egor',
      orderAmountCents: 0,
      lossReason: '',
      adminNotes: 'Called'
    });
    const contacted = await getContactSubmission(db, created.id);
    expect(contacted).toMatchObject({
      status: 'contacted',
      assignedTo: 'Egor',
      adminNotes: 'Called'
    });
    expect(contacted?.firstContactedAt).toBeInstanceOf(Date);

    const firstContactedAt = contacted?.firstContactedAt?.getTime();
    await updateContactSubmissionPipeline(db, created.id, {
      status: 'qualified',
      assignedTo: 'Egor',
      orderAmountCents: 15_000,
      lossReason: 'must be cleared',
      adminNotes: 'Booked diagnostic'
    });
    const qualified = await getContactSubmission(db, created.id);
    expect(qualified).toMatchObject({
      status: 'qualified',
      orderAmountCents: 15_000,
      lossReason: ''
    });
    expect(qualified?.firstContactedAt?.getTime()).toBe(firstContactedAt);
    expect(qualified?.qualifiedAt).toBeInstanceOf(Date);
    expect(qualified?.updatedAt).toBeInstanceOf(Date);
  });

  it('does not invent skipped milestones when a lead jumps directly to completed', async () => {
    await db.insert(contactSubmissions).values({
      name: 'Direct job', phone: '+372 5555 0099', comment: '', locale: 'ru', createdAt: new Date()
    });
    const [created] = await getContactSubmissions(db);
    await updateContactSubmissionPipeline(db, created.id, {
      status: 'completed', assignedTo: 'Danik', orderAmountCents: 20_000,
      lossReason: '', adminNotes: 'Walk-in job'
    });
    const completed = await getContactSubmission(db, created.id);
    expect(completed?.completedAt).toBeInstanceOf(Date);
    expect(completed?.firstContactedAt).toBeNull();
    expect(completed?.qualifiedAt).toBeNull();
    expect(completed?.bookedAt).toBeNull();
  });

  it('stores the DPFLAB route, diagnostic result and customer-direct partner price separately', async () => {
    await db.insert(contactSubmissions).values({
      name: 'Partner job', phone: '+372 5555 1000', locale: 'ru', createdAt: new Date()
    });
    const [created] = await getContactSubmissions(db);
    await updateLeadOperations(db, created.id, {
      serviceType: 'dpf',
      filterState: 'installed',
      vehicle: 'Volvo XC60 2.0D',
      registrationNumber: '123 ABC',
      partNumber: 'DPF-42',
      diagnosticCode: 'P2002',
      pressureBeforeMbar: 180,
      pressureAfterMbar: 22,
      partnerWorkshop: 'Partner OÜ',
      partnerContact: '+372 500 0000',
      partnerCustomerPriceCents: 8_000,
      partnerPaymentModel: 'customer_direct',
      pickupAddress: '',
      actor: 'Egor'
    });
    await updateContactSubmissionPipeline(db, created.id, {
      status: 'partner',
      assignedTo: 'Luka',
      orderAmountCents: 15_000,
      lossReason: '',
      adminNotes: 'Partner removes the filter'
    });
    const row = await getContactSubmission(db, created.id);
    expect(row).toMatchObject({
      status: 'partner',
      partnerPaymentModel: 'customer_direct',
      partnerCustomerPriceCents: 8_000,
      orderAmountCents: 15_000,
      pressureBeforeMbar: 180,
      pressureAfterMbar: 22
    });
    expect(row?.partnerAt).toBeInstanceOf(Date);
  });

  it('keeps a paid job in completion-period reporting after a follow-up status', async () => {
    await db.insert(contactSubmissions).values({
      name: 'Paid job', phone: '+372 5555 2000', locale: 'ru', createdAt: new Date()
    });
    const [created] = await getContactSubmissions(db);
    await updateContactSubmissionPipeline(db, created.id, {
      status: 'completed', assignedTo: 'Danik', orderAmountCents: 18_000,
      lossReason: '', adminNotes: 'Paid'
    });
    const paid = await getContactSubmission(db, created.id);
    await updateContactSubmissionPipeline(db, created.id, {
      status: 'follow_up', assignedTo: 'Danik', orderAmountCents: 18_000,
      lossReason: '', adminNotes: 'Check after installation'
    });
    const rows = await getCompletedSubmissionsForPeriod(db, {
      from: new Date(paid!.completedAt!.getTime() - 1_000),
      to: new Date(paid!.completedAt!.getTime() + 1_000)
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: 'follow_up', orderAmountCents: 18_000 });
    expect(rows[0].completedAt).toEqual(paid!.completedAt);
  });
});
