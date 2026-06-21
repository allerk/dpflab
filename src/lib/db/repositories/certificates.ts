import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { certificates } from '../schema';
import { getLang } from '../langstr';

export type CertificateItem = { title: string; text: string };
export type CertificateRow = { id: number; title: string; text: string; sortOrder: number };

export async function getCertificates(db: Db, locale: string): Promise<CertificateItem[]> {
  const rows = await db
    .select({ title: certificates.title, text: certificates.text })
    .from(certificates)
    .orderBy(asc(certificates.sortOrder));

  return rows.map((row) => ({
    title: getLang(row.title, locale),
    text: getLang(row.text, locale)
  }));
}

export async function getCertificateRows(db: Db): Promise<CertificateRow[]> {
  return db
    .select({
      id: certificates.id,
      title: certificates.title,
      text: certificates.text,
      sortOrder: certificates.sortOrder
    })
    .from(certificates)
    .orderBy(asc(certificates.sortOrder));
}

export async function createCertificate(
  db: Db,
  data: { title: string; text: string }
): Promise<void> {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${certificates.sortOrder}), 0)` })
    .from(certificates);
  await db.insert(certificates).values({ title: data.title, text: data.text, sortOrder: max + 1 });
}

export async function updateCertificate(
  db: Db,
  id: number,
  data: { title: string; text: string }
): Promise<void> {
  await db
    .update(certificates)
    .set({ title: data.title, text: data.text })
    .where(eq(certificates.id, id));
}

export async function deleteCertificate(db: Db, id: number): Promise<void> {
  await db.delete(certificates).where(eq(certificates.id, id));
  const remaining = await db
    .select({ id: certificates.id })
    .from(certificates)
    .orderBy(asc(certificates.sortOrder));
  for (let i = 0; i < remaining.length; i++) {
    await db
      .update(certificates)
      .set({ sortOrder: i + 1 })
      .where(eq(certificates.id, remaining[i].id));
  }
}

export async function reorderCertificate(
  db: Db,
  id: number,
  direction: 'up' | 'down'
): Promise<void> {
  const rows = await db
    .select({ id: certificates.id, sortOrder: certificates.sortOrder })
    .from(certificates)
    .orderBy(asc(certificates.sortOrder));
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return;
  const target = rows[idx];
  const swap = rows[swapIdx];
  await db
    .update(certificates)
    .set({ sortOrder: swap.sortOrder })
    .where(eq(certificates.id, target.id));
  await db
    .update(certificates)
    .set({ sortOrder: target.sortOrder })
    .where(eq(certificates.id, swap.id));
}
