import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import {
  createBusinessExpense,
  deleteBusinessExpense,
  getBusinessExpenseTotals,
  listBusinessExpenses
} from '../../src/lib/db/repositories/business-expenses';

describe('business expense ledger', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('records shared expenses by date without allocating them to a lead', async () => {
    await createBusinessExpense(db, {
      expenseDate: '2026-08-01',
      category: 'utilities',
      amountCents: 12_500,
      vendor: 'Electricity and water',
      createdBy: 'Egor'
    });
    await createBusinessExpense(db, {
      expenseDate: '2026-08-05',
      category: 'equipment',
      amountCents: 5_000,
      vendor: 'Tool shop'
    });

    const rows = await listBusinessExpenses(db, { dateFrom: '2026-08-01', dateTo: '2026-08-31' });
    expect(rows.map((row) => row.category)).toEqual(['equipment', 'utilities']);
    await expect(getBusinessExpenseTotals(db, {
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31'
    })).resolves.toEqual([{ currency: 'EUR', amountCents: 17_500 }]);
  });

  it('deletes only the selected expense', async () => {
    const id = await createBusinessExpense(db, {
      expenseDate: '2026-08-10', category: 'transport', amountCents: 2_000
    });
    await expect(deleteBusinessExpense(db, id)).resolves.toBe(true);
    await expect(deleteBusinessExpense(db, id)).resolves.toBe(false);
  });

  it('rejects impossible calendar dates', async () => {
    await expect(createBusinessExpense(db, {
      expenseDate: '2026-02-31', category: 'utilities', amountCents: 1_000
    })).rejects.toThrow('Invalid expense date');
  });
});
