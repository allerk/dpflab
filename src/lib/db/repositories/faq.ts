import { asc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { faq } from '../schema';

export type FaqItem = { question: string; answer: string };

export async function getFaqItems(db: Db, locale: string): Promise<FaqItem[]> {
  return db
    .select({ question: faq.question, answer: faq.answer })
    .from(faq)
    .where(eq(faq.locale, locale))
    .orderBy(asc(faq.sortOrder));
}
