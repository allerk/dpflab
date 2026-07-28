import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contactSubmissions } from '../../src/lib/db/schema';
import {
  createContactSubmission,
  type SubmissionInput
} from '../../src/lib/db/repositories/contact-submissions';

const submission = (overrides: Partial<SubmissionInput>): SubmissionInput => ({
  name: 'Test',
  phone: '+372 5000 0000',
  email: '',
  clientType: 'private',
  serviceType: 'dpf',
  filterState: 'removed',
  vehicle: 'VW Passat 2.0 TDI',
  urgency: 'days_1_3',
  preferredContact: 'phone',
  privacyVersion: '2026-07-23',
  locale: 'ru',
  ...overrides
});

describe('createContactSubmission', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('inserts a submission row', async () => {
    const id = await createContactSubmission(db, submission({
      name: 'Alice',
      phone: '+372 5000 0000',
      email: 'alice@example.com',
      comment: 'Hello',
      locale: 'ru'
    }));

    const rows = await db.select().from(contactSubmissions);
    expect(id).toBe(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Alice', phone: '+372 5000 0000', email: 'alice@example.com', comment: 'Hello', locale: 'ru' });
    expect(rows[0].createdAt).toBeInstanceOf(Date);
  });

  it('stores empty comment when not provided', async () => {
    await createContactSubmission(db, submission({ name: 'Bob', phone: '+372 5000 0001', email: 'bob@example.com', locale: 'et' }));

    const rows = await db.select().from(contactSubmissions);
    expect(rows[0].comment).toBe('');
  });

  it('inserts multiple submissions independently', async () => {
    await createContactSubmission(db, submission({ name: 'Alice', phone: '+372 1', email: 'alice@example.com', locale: 'ru' }));
    await createContactSubmission(db, submission({ name: 'Bob', phone: '+372 2', email: 'bob@example.com', locale: 'et' }));

    const rows = await db.select().from(contactSubmissions);
    expect(rows).toHaveLength(2);
  });
});
