import { asc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { pricing } from '../schema';

export type PricingItem = { icon: string; title: string; price: string; cta: string };

export async function getPricingItems(db: Db, locale: string): Promise<PricingItem[]> {
  return db
    .select({ icon: pricing.icon, title: pricing.title, price: pricing.price, cta: pricing.cta })
    .from(pricing)
    .where(eq(pricing.locale, locale))
    .orderBy(asc(pricing.sortOrder));
}
