import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { pricing } from '../../src/lib/db/schema';
import { makeLangStr } from '../../src/lib/db/langstr';
import { getPricingItems } from '../../src/lib/db/repositories/pricing';

describe('getPricingItems', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('translates title/cta and keeps icon/price as-is, ordered by sort_order', async () => {
    await db.insert(pricing).values([
      {
        icon: 'bolt',
        title: makeLangStr({ ee: 'Kiirpuhastus', ru: 'Срочная очистка' }),
        price: '200€',
        cta: makeLangStr({ ee: 'Tellida', ru: 'Заказать' }),
        sortOrder: 3
      },
      {
        icon: 'filter',
        title: makeLangStr({ ee: 'Puhastus', ru: 'Очистка' }),
        price: '150€',
        cta: makeLangStr({ ee: 'Tellida', ru: 'Заказать' }),
        sortOrder: 1
      }
    ]);

    const items = await getPricingItems(db, 'ru');

    expect(items).toEqual([
      { icon: 'filter', title: 'Очистка', price: '150€', cta: 'Заказать' },
      { icon: 'bolt', title: 'Срочная очистка', price: '200€', cta: 'Заказать' }
    ]);
  });

  it('returns empty array when no rows exist', async () => {
    expect(await getPricingItems(db, 'ru')).toEqual([]);
  });
});
