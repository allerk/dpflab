import { asc } from 'drizzle-orm';
import type { Db } from '../types';
import { pricing } from '../schema';
import { getLang } from '../langstr';

export type PricingItem = { icon: string; title: string; price: string; cta: string };

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
