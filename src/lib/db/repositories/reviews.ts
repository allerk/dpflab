import { asc } from 'drizzle-orm';
import type { Db } from '../types';
import { reviews } from '../schema';
import { getLang } from '../langstr';

export type ReviewItem = { stars: number; text: string; author: string };

export async function getReviews(db: Db, locale: string): Promise<ReviewItem[]> {
  const rows = await db
    .select({ stars: reviews.stars, text: reviews.text, author: reviews.author })
    .from(reviews)
    .orderBy(asc(reviews.sortOrder));

  return rows.map((row) => ({
    stars: row.stars,
    text: getLang(row.text, locale),
    author: row.author
  }));
}
