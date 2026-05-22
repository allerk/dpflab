import type { Db } from '../types';
import { siteImages } from '../schema';

export const SITE_IMAGE_KEYS = ['hero_main', 'why_main', 'contact_workshop'] as const;
export type SiteImageKey = (typeof SITE_IMAGE_KEYS)[number];

export type SiteImagesMap = Record<SiteImageKey, string | null>;

export async function getSiteImages(db: Db): Promise<SiteImagesMap> {
  const rows = await db.select().from(siteImages);
  const result = Object.fromEntries(SITE_IMAGE_KEYS.map((k) => [k, null])) as SiteImagesMap;
  for (const row of rows) {
    if (SITE_IMAGE_KEYS.includes(row.key as SiteImageKey)) {
      result[row.key as SiteImageKey] = row.filename ?? null;
    }
  }
  return result;
}

export async function setSiteImage(db: Db, key: SiteImageKey, filename: string | null): Promise<void> {
  await db
    .insert(siteImages)
    .values({ key, filename })
    .onConflictDoUpdate({ target: siteImages.key, set: { filename } });
}
