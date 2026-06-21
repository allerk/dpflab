import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { faq } from '../../src/lib/db/schema';
import { makeLangStr } from '../../src/lib/db/langstr';
import { getFaqItems } from '../../src/lib/db/repositories/faq';

describe('getFaqItems', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns items in the requested locale ordered by sort_order', async () => {
    await db.insert(faq).values([
      {
        question: makeLangStr({ et: 'Q2-et', ru: 'Q2-ru' }),
        answer: makeLangStr({ et: 'A2-et', ru: 'A2-ru' }),
        sortOrder: 2
      },
      {
        question: makeLangStr({ et: 'Q1-et', ru: 'Q1-ru' }),
        answer: makeLangStr({ et: 'A1-et', ru: 'A1-ru' }),
        sortOrder: 1
      }
    ]);

    const items = await getFaqItems(db, 'ru');

    expect(items).toEqual([
      { question: 'Q1-ru', answer: 'A1-ru' },
      { question: 'Q2-ru', answer: 'A2-ru' }
    ]);
  });

  it('returns empty array when no rows exist', async () => {
    const items = await getFaqItems(db, 'ru');
    expect(items).toEqual([]);
  });

  it("falls back to 'et' when the requested locale is missing", async () => {
    await db.insert(faq).values([
      {
        question: makeLangStr({ et: 'Q-et', ru: 'Q-ru' }),
        answer: makeLangStr({ et: 'A-et', ru: 'A-ru' }),
        sortOrder: 1
      }
    ]);

    const items = await getFaqItems(db, 'fi');

    expect(items).toEqual([{ question: 'Q-et', answer: 'A-et' }]);
  });
});
