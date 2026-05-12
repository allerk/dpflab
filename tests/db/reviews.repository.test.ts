import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { reviews } from '../../src/lib/db/schema';
import { getReviews } from '../../src/lib/db/repositories/reviews';

describe('getReviews', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns reviews for the requested locale ordered by sort_order', async () => {
    await db.insert(reviews).values([
      { locale: 'ru', stars: 5, text: 'Great', author: 'Alice', sortOrder: 2 },
      { locale: 'ru', stars: 4, text: 'Good', author: 'Bob', sortOrder: 1 },
      { locale: 'ee', stars: 5, text: 'Suurepärane', author: 'Tiit', sortOrder: 1 }
    ]);

    const items = await getReviews(db, 'ru');

    expect(items).toEqual([
      { stars: 4, text: 'Good', author: 'Bob' },
      { stars: 5, text: 'Great', author: 'Alice' }
    ]);
  });

  it('returns empty array when no reviews for locale', async () => {
    const items = await getReviews(db, 'ru');
    expect(items).toEqual([]);
  });

  it('excludes reviews from other locales', async () => {
    await db.insert(reviews).values([{ locale: 'ee', stars: 5, text: 'T', author: 'T', sortOrder: 1 }]);
    const items = await getReviews(db, 'ru');
    expect(items).toEqual([]);
  });
});
