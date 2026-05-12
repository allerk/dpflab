import { asc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { certificates } from '../schema';

export type CertificateItem = { title: string; text: string };

export async function getCertificates(db: Db, locale: string): Promise<CertificateItem[]> {
  return db
    .select({ title: certificates.title, text: certificates.text })
    .from(certificates)
    .where(eq(certificates.locale, locale))
    .orderBy(asc(certificates.sortOrder));
}
