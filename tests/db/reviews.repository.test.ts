import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { reviews } from '../../src/lib/db/schema';
import { makeLangStr } from '../../src/lib/db/langstr';
import { getReviews } from '../../src/lib/db/repositories/reviews';

describe('getReviews', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns reviews in the requested locale ordered by sort_order', async () => {
    await db.insert(reviews).values([
      {
        stars: 5,
        text: makeLangStr({ et: 'Suurepärane', ru: 'Отлично' }),
        author: '— Alice',
        sortOrder: 2
      },
      {
        stars: 4,
        text: makeLangStr({ et: 'Hea', ru: 'Хорошо' }),
        author: '— Bob',
        sortOrder: 1
      }
    ]);

    const items = await getReviews(db, 'ru');

    expect(items).toEqual([
      { stars: 4, text: 'Хорошо', author: '— Bob' },
      { stars: 5, text: 'Отлично', author: '— Alice' }
    ]);
  });

  it('keeps author as plain text regardless of locale', async () => {
    await db.insert(reviews).values([
      {
        stars: 5,
        text: makeLangStr({ et: 'T', ru: 'T' }),
        author: '— AutoPro OÜ',
        sortOrder: 1
      }
    ]);

    expect(await getReviews(db, 'ru')).toEqual([{ stars: 5, text: 'T', author: '— AutoPro OÜ' }]);
    expect(await getReviews(db, 'et')).toEqual([{ stars: 5, text: 'T', author: '— AutoPro OÜ' }]);
  });

  it("falls back to 'et' when the requested locale is missing", async () => {
    await db.insert(reviews).values([
      {
        stars: 5,
        text: makeLangStr({ et: 'Suurepärane', ru: 'Отлично' }),
        author: '— Author',
        sortOrder: 1
      }
    ]);

    const items = await getReviews(db, 'fi');
    expect(items).toEqual([{ stars: 5, text: 'Suurepärane', author: '— Author' }]);
  });
});
