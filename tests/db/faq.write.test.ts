import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { faq } from '../../src/lib/db/schema';
import { makeLangStr } from '../../src/lib/db/langstr';
import {
  getFaqRows,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItem
} from '../../src/lib/db/repositories/faq';

describe('faq write functions', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('createFaqItem inserts a row at the end', async () => {
    await db.insert(faq).values({ question: makeLangStr({ ru: 'Q1', et: 'Q1et' }), answer: makeLangStr({ ru: 'A1', et: 'A1et' }), sortOrder: 1 });
    await createFaqItem(db, { question: makeLangStr({ ru: 'Q2', et: 'Q2et' }), answer: makeLangStr({ ru: 'A2', et: 'A2et' }) });

    const rows = await getFaqRows(db);
    expect(rows).toHaveLength(2);
    expect(rows[1].sortOrder).toBe(2);
  });

  it('createFaqItem on empty table uses sortOrder 1', async () => {
    await createFaqItem(db, { question: makeLangStr({ ru: 'Q', et: 'Q' }), answer: makeLangStr({ ru: 'A', et: 'A' }) });
    const rows = await getFaqRows(db);
    expect(rows[0].sortOrder).toBe(1);
  });

  it('updateFaqItem changes question and answer', async () => {
    await db.insert(faq).values({ question: makeLangStr({ ru: 'Old', et: 'Old-et' }), answer: makeLangStr({ ru: 'OldA', et: 'OldA-et' }), sortOrder: 1 });
    const [row] = await getFaqRows(db);
    await updateFaqItem(db, row.id, { question: makeLangStr({ ru: 'New', et: 'New-et' }), answer: makeLangStr({ ru: 'NewA', et: 'NewA-et' }) });

    const updated = await getFaqRows(db);
    expect(updated[0].question).toBe(makeLangStr({ ru: 'New', et: 'New-et' }));
  });

  it('deleteFaqItem removes the row and compacts sort_order', async () => {
    await db.insert(faq).values([
      { question: makeLangStr({ ru: 'Q1', et: 'Q1' }), answer: makeLangStr({ ru: 'A1', et: 'A1' }), sortOrder: 1 },
      { question: makeLangStr({ ru: 'Q2', et: 'Q2' }), answer: makeLangStr({ ru: 'A2', et: 'A2' }), sortOrder: 2 },
      { question: makeLangStr({ ru: 'Q3', et: 'Q3' }), answer: makeLangStr({ ru: 'A3', et: 'A3' }), sortOrder: 3 }
    ]);
    const rows = await getFaqRows(db);
    await deleteFaqItem(db, rows[1].id); // delete middle row

    const remaining = await getFaqRows(db);
    expect(remaining).toHaveLength(2);
    expect(remaining.map((r) => r.sortOrder)).toEqual([1, 2]);
  });

  it('reorderFaqItem swaps sort_order with the row above', async () => {
    await db.insert(faq).values([
      { question: makeLangStr({ ru: 'Q1', et: 'Q1' }), answer: makeLangStr({ ru: 'A1', et: 'A1' }), sortOrder: 1 },
      { question: makeLangStr({ ru: 'Q2', et: 'Q2' }), answer: makeLangStr({ ru: 'A2', et: 'A2' }), sortOrder: 2 }
    ]);
    const rows = await getFaqRows(db);
    await reorderFaqItem(db, rows[1].id, 'up');

    const reordered = await getFaqRows(db);
    expect(reordered[0].sortOrder).toBe(1);
    expect(reordered[0].question).toBe(makeLangStr({ ru: 'Q2', et: 'Q2' }));
  });

  it('reorderFaqItem is a no-op when already at the top', async () => {
    await db.insert(faq).values({ question: makeLangStr({ ru: 'Q1', et: 'Q1' }), answer: makeLangStr({ ru: 'A1', et: 'A1' }), sortOrder: 1 });
    const [row] = await getFaqRows(db);
    await reorderFaqItem(db, row.id, 'up'); // should not throw

    const rows = await getFaqRows(db);
    expect(rows[0].sortOrder).toBe(1);
  });
});
