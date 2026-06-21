import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { beforeAfter } from '../schema';

export type BeforeAfterRow = {
  id: number;
  sliderEnabled: boolean;
  imageBefore: string | null;
  imageAfter: string | null;
  sortOrder: number;
};

export async function getBeforeAfterRows(db: Db): Promise<BeforeAfterRow[]> {
  return db.select().from(beforeAfter).orderBy(asc(beforeAfter.sortOrder));
}

export async function createBeforeAfterItem(
  db: Db,
  data: { sliderEnabled: boolean; imageBefore: string | null; imageAfter: string | null }
): Promise<void> {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${beforeAfter.sortOrder}), 0)` })
    .from(beforeAfter);
  await db.insert(beforeAfter).values({ ...data, sortOrder: max + 1 });
}

export async function updateBeforeAfterItem(
  db: Db,
  id: number,
  data: { sliderEnabled: boolean; imageBefore: string | null; imageAfter: string | null }
): Promise<void> {
  await db.update(beforeAfter).set(data).where(eq(beforeAfter.id, id));
}

export async function deleteBeforeAfterItem(db: Db, id: number): Promise<void> {
  await db.delete(beforeAfter).where(eq(beforeAfter.id, id));
  const remaining = await db
    .select({ id: beforeAfter.id })
    .from(beforeAfter)
    .orderBy(asc(beforeAfter.sortOrder));
  for (let i = 0; i < remaining.length; i++) {
    await db.update(beforeAfter).set({ sortOrder: i + 1 }).where(eq(beforeAfter.id, remaining[i].id));
  }
}

export async function reorderBeforeAfterItem(
  db: Db,
  id: number,
  direction: 'up' | 'down'
): Promise<void> {
  const rows = await db
    .select({ id: beforeAfter.id, sortOrder: beforeAfter.sortOrder })
    .from(beforeAfter)
    .orderBy(asc(beforeAfter.sortOrder));
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return;
  const a = rows[idx];
  const b = rows[swapIdx];
  await db.update(beforeAfter).set({ sortOrder: b.sortOrder }).where(eq(beforeAfter.id, a.id));
  await db.update(beforeAfter).set({ sortOrder: a.sortOrder }).where(eq(beforeAfter.id, b.id));
}
