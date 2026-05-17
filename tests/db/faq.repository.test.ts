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
        question: makeLangStr({ ee: 'Q2-ee', ru: 'Q2-ru' }),
        answer: makeLangStr({ ee: 'A2-ee', ru: 'A2-ru' }),
        sortOrder: 2
      },
      {
        question: makeLangStr({ ee: 'Q1-ee', ru: 'Q1-ru' }),
        answer: makeLangStr({ ee: 'A1-ee', ru: 'A1-ru' }),
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

  it("falls back to 'ee' when the requested locale is missing", async () => {
    await db.insert(faq).values([
      {
        question: makeLangStr({ ee: 'Q-ee', ru: 'Q-ru' }),
        answer: makeLangStr({ ee: 'A-ee', ru: 'A-ru' }),
        sortOrder: 1
      }
    ]);

    const items = await getFaqItems(db, 'fi');

    expect(items).toEqual([{ question: 'Q-ee', answer: 'A-ee' }]);
  });
});
