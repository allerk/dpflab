import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { pricing } from '../../src/lib/db/schema';
import { getPricingItems } from '../../src/lib/db/repositories/pricing';

describe('getPricingItems', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns pricing items for the requested locale ordered by sort_order', async () => {
    await db.insert(pricing).values([
      { locale: 'ru', icon: 'bolt', title: 'Срочная', price: 'от 200€', cta: 'Заказать', sortOrder: 3 },
      { locale: 'ru', icon: 'filter', title: 'Очистка', price: 'от 150€', cta: 'Заказать', sortOrder: 1 },
      { locale: 'ee', icon: 'filter', title: 'Puhastus', price: 'alates 150€', cta: 'Tellida', sortOrder: 1 }
    ]);

    const items = await getPricingItems(db, 'ru');

    expect(items).toEqual([
      { icon: 'filter', title: 'Очистка', price: 'от 150€', cta: 'Заказать' },
      { icon: 'bolt', title: 'Срочная', price: 'от 200€', cta: 'Заказать' }
    ]);
  });

  it('returns empty array when no pricing items for locale', async () => {
    const items = await getPricingItems(db, 'ru');
    expect(items).toEqual([]);
  });

  it('excludes items from other locales', async () => {
    await db.insert(pricing).values([{ locale: 'ee', icon: 'filter', title: 'T', price: 'P', cta: 'C', sortOrder: 1 }]);
    const items = await getPricingItems(db, 'ru');
    expect(items).toEqual([]);
  });
});
