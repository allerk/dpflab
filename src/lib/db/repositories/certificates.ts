import { asc } from 'drizzle-orm';
import type { Db } from '../types';
import { certificates } from '../schema';
import { getLang } from '../langstr';

export type CertificateItem = { title: string; text: string };

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
