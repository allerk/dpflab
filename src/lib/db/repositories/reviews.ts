import { asc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { reviews } from '../schema';

export type ReviewItem = { stars: number; text: string; author: string };

export async function getReviews(db: Db, locale: string): Promise<ReviewItem[]> {
  return db
    .select({ stars: reviews.stars, text: reviews.text, author: reviews.author })
    .from(reviews)
    .where(eq(reviews.locale, locale))
    .orderBy(asc(reviews.sortOrder));
}
