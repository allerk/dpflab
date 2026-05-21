import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { faq } from '../schema';
import { getLang } from '../langstr';

export type FaqItem = { question: string; answer: string };
export type FaqRow = { id: number; question: string; answer: string; sortOrder: number };

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

export async function getFaqRows(db: Db): Promise<FaqRow[]> {
  return db
    .select({ id: faq.id, question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder })
    .from(faq)
    .orderBy(asc(faq.sortOrder));
}

export async function createFaqItem(db: Db, data: { question: string; answer: string }): Promise<void> {
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${faq.sortOrder}), 0)` }).from(faq);
  await db.insert(faq).values({ question: data.question, answer: data.answer, sortOrder: max + 1 });
}

export async function updateFaqItem(
  db: Db,
  id: number,
  data: { question: string; answer: string }
): Promise<void> {
  await db.update(faq).set({ question: data.question, answer: data.answer }).where(eq(faq.id, id));
}

export async function deleteFaqItem(db: Db, id: number): Promise<void> {
  await db.delete(faq).where(eq(faq.id, id));
  const remaining = await db.select({ id: faq.id }).from(faq).orderBy(asc(faq.sortOrder));
  for (let i = 0; i < remaining.length; i++) {
    await db.update(faq).set({ sortOrder: i + 1 }).where(eq(faq.id, remaining[i].id));
  }
}

export async function reorderFaqItem(db: Db, id: number, direction: 'up' | 'down'): Promise<void> {
  const rows = await db
    .select({ id: faq.id, sortOrder: faq.sortOrder })
    .from(faq)
    .orderBy(asc(faq.sortOrder));
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return;
  const target = rows[idx];
  const swap = rows[swapIdx];
  await db.update(faq).set({ sortOrder: swap.sortOrder }).where(eq(faq.id, target.id));
  await db.update(faq).set({ sortOrder: target.sortOrder }).where(eq(faq.id, swap.id));
}
