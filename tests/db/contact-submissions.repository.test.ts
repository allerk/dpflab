import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contactSubmissions } from '../../src/lib/db/schema';
import { createContactSubmission } from '../../src/lib/db/repositories/contact-submissions';

describe('createContactSubmission', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('inserts a submission row', async () => {
    await createContactSubmission(db, {
      name: 'Alice',
      phone: '+372 5000 0000',
      comment: 'Hello',
      locale: 'ru'
    });

    const rows = await db.select().from(contactSubmissions);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Alice', phone: '+372 5000 0000', comment: 'Hello', locale: 'ru' });
    expect(rows[0].createdAt).toBeInstanceOf(Date);
  });

  it('stores empty comment when not provided', async () => {
    await createContactSubmission(db, { name: 'Bob', phone: '+372 5000 0001', locale: 'et' });

    const rows = await db.select().from(contactSubmissions);
    expect(rows[0].comment).toBe('');
  });

  it('inserts multiple submissions independently', async () => {
    await createContactSubmission(db, { name: 'Alice', phone: '+372 1', locale: 'ru' });
    await createContactSubmission(db, { name: 'Bob', phone: '+372 2', locale: 'et' });

    const rows = await db.select().from(contactSubmissions);
    expect(rows).toHaveLength(2);
  });
});
