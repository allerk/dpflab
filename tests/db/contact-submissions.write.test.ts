import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contactSubmissions } from '../../src/lib/db/schema';
import {
  getContactSubmissions,
  getContactSubmissionsForPeriod,
  getContactSubmission,
  deleteContactSubmission,
  updateContactSubmissionPipeline
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
});
