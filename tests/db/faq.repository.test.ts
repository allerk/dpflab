import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { faq } from '../../src/lib/db/schema';
import { getFaqItems } from '../../src/lib/db/repositories/faq';

describe('getFaqItems', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns items for the requested locale ordered by sort_order', async () => {
    await db.insert(faq).values([
      { locale: 'ru', question: 'Q2', answer: 'A2', sortOrder: 2 },
      { locale: 'ru', question: 'Q1', answer: 'A1', sortOrder: 1 },
      { locale: 'ee', question: 'Q-ee', answer: 'A-ee', sortOrder: 1 }
    ]);

    const items = await getFaqItems(db, 'ru');

    expect(items).toEqual([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' }
    ]);
  });

  it('returns empty array when no items exist for locale', async () => {
    const items = await getFaqItems(db, 'ru');
    expect(items).toEqual([]);
  });

  it('excludes items from other locales', async () => {
    await db.insert(faq).values([{ locale: 'ee', question: 'Q', answer: 'A', sortOrder: 1 }]);
    const items = await getFaqItems(db, 'ru');
    expect(items).toEqual([]);
  });
});
