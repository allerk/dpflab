import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { reviews } from '../../src/lib/db/schema';
import { getReviews } from '../../src/lib/db/repositories/reviews';

describe('getReviews', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns reviews ordered by sort_order', async () => {
    await db.insert(reviews).values([
      { stars: 5, text: 'Suurepärane', author: '— Alice', locale: 'et', sortOrder: 2 },
      { stars: 4, text: 'Хорошо', author: '— Bob', locale: 'ru', sortOrder: 1 }
    ]);

    const items = await getReviews(db);

    expect(items).toEqual([
      { stars: 4, text: 'Хорошо', author: '— Bob', locale: 'ru' },
      { stars: 5, text: 'Suurepärane', author: '— Alice', locale: 'et' }
    ]);
  });

  it('returns empty array when no rows exist', async () => {
    expect(await getReviews(db)).toEqual([]);
  });

  it('preserves each review in its original language', async () => {
    await db.insert(reviews).values([
      { stars: 5, text: 'Отличный сервис!', author: '— AutoPro OÜ', locale: 'ru', sortOrder: 1 }
    ]);

    const items = await getReviews(db);
    expect(items[0].text).toBe('Отличный сервис!');
    expect(items[0].locale).toBe('ru');
  });
});
