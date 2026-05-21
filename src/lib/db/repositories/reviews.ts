import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { reviews } from '../schema';

export type ReviewItem = { stars: number; text: string; author: string; locale: string };
export type ReviewRow = {
  id: number;
  stars: number;
  text: string;
  author: string;
  locale: string;
  sortOrder: number;
};

export async function getReviews(db: Db): Promise<ReviewItem[]> {
  const rows = await db
    .select({ stars: reviews.stars, text: reviews.text, author: reviews.author, locale: reviews.locale })
    .from(reviews)
    .orderBy(asc(reviews.sortOrder));
  return rows;
}

export async function getReviewRows(db: Db): Promise<ReviewRow[]> {
  return db
    .select({
      id: reviews.id,
      stars: reviews.stars,
      text: reviews.text,
      author: reviews.author,
      locale: reviews.locale,
      sortOrder: reviews.sortOrder
    })
    .from(reviews)
    .orderBy(asc(reviews.sortOrder));
}

export async function createReview(
  db: Db,
  data: { stars: number; text: string; author: string; locale: string }
): Promise<void> {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${reviews.sortOrder}), 0)` })
    .from(reviews);
  await db.insert(reviews).values({
    stars: data.stars,
    text: data.text,
    author: data.author,
    locale: data.locale,
    sortOrder: max + 1
  });
}

export async function updateReview(
  db: Db,
  id: number,
  data: { stars: number; text: string; author: string; locale: string }
): Promise<void> {
  await db
    .update(reviews)
    .set({ stars: data.stars, text: data.text, author: data.author, locale: data.locale })
    .where(eq(reviews.id, id));
}

export async function deleteReview(db: Db, id: number): Promise<void> {
  await db.delete(reviews).where(eq(reviews.id, id));
  const remaining = await db.select({ id: reviews.id }).from(reviews).orderBy(asc(reviews.sortOrder));
  for (let i = 0; i < remaining.length; i++) {
    await db.update(reviews).set({ sortOrder: i + 1 }).where(eq(reviews.id, remaining[i].id));
  }
}

export async function reorderReview(db: Db, id: number, direction: 'up' | 'down'): Promise<void> {
  const rows = await db
    .select({ id: reviews.id, sortOrder: reviews.sortOrder })
    .from(reviews)
    .orderBy(asc(reviews.sortOrder));
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return;
  const target = rows[idx];
  const swap = rows[swapIdx];
  await db.update(reviews).set({ sortOrder: swap.sortOrder }).where(eq(reviews.id, target.id));
  await db.update(reviews).set({ sortOrder: target.sortOrder }).where(eq(reviews.id, swap.id));
}
