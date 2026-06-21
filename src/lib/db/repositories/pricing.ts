import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { pricing } from '../schema';
import { getLang } from '../langstr';

export type PricingItem = { icon: string; title: string; price: string; cta: string };
export type PricingRow = {
  id: number;
  icon: string;
  title: string;
  price: string;
  cta: string;
  sortOrder: number;
};

export async function getPricingItems(db: Db, locale: string): Promise<PricingItem[]> {
  const rows = await db
    .select({ icon: pricing.icon, title: pricing.title, price: pricing.price, cta: pricing.cta })
    .from(pricing)
    .orderBy(asc(pricing.sortOrder));

  return rows.map((row) => ({
    icon: row.icon,
    title: getLang(row.title, locale),
    price: row.price,
    cta: getLang(row.cta, locale)
  }));
}

export async function getPricingRows(db: Db): Promise<PricingRow[]> {
  return db
    .select({
      id: pricing.id,
      icon: pricing.icon,
      title: pricing.title,
      price: pricing.price,
      cta: pricing.cta,
      sortOrder: pricing.sortOrder
    })
    .from(pricing)
    .orderBy(asc(pricing.sortOrder));
}

export async function createPricingItem(
  db: Db,
  data: { icon: string; title: string; price: string; cta: string }
): Promise<void> {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${pricing.sortOrder}), 0)` })
    .from(pricing);
  await db
    .insert(pricing)
    .values({ icon: data.icon, title: data.title, price: data.price, cta: data.cta, sortOrder: max + 1 });
}

export async function updatePricingItem(
  db: Db,
  id: number,
  data: { icon: string; title: string; price: string; cta: string }
): Promise<void> {
  await db
    .update(pricing)
    .set({ icon: data.icon, title: data.title, price: data.price, cta: data.cta })
    .where(eq(pricing.id, id));
}

export async function deletePricingItem(db: Db, id: number): Promise<void> {
  await db.delete(pricing).where(eq(pricing.id, id));
  const remaining = await db.select({ id: pricing.id }).from(pricing).orderBy(asc(pricing.sortOrder));
  for (let i = 0; i < remaining.length; i++) {
    await db.update(pricing).set({ sortOrder: i + 1 }).where(eq(pricing.id, remaining[i].id));
  }
}

export async function reorderPricingItem(db: Db, id: number, direction: 'up' | 'down'): Promise<void> {
  const rows = await db
    .select({ id: pricing.id, sortOrder: pricing.sortOrder })
    .from(pricing)
    .orderBy(asc(pricing.sortOrder));
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return;
  const target = rows[idx];
  const swap = rows[swapIdx];
  await db.update(pricing).set({ sortOrder: swap.sortOrder }).where(eq(pricing.id, target.id));
  await db.update(pricing).set({ sortOrder: target.sortOrder }).where(eq(pricing.id, swap.id));
}
