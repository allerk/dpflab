import { asc } from 'drizzle-orm';
import type { Db } from '../types';
import { faq } from '../schema';
import { getLang } from '../langstr';

export type FaqItem = { question: string; answer: string };

export async function getFaqItems(db: Db, locale: string): Promise<FaqItem[]> {
  const rows = await db
    .select({ question: faq.question, answer: faq.answer })
    .from(faq)
    .orderBy(asc(faq.sortOrder));

  return rows.map((row) => ({
    question: getLang(row.question, locale),
    answer: getLang(row.answer, locale)
  }));
}
