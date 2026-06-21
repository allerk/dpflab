import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db/index';
import { getSiteImages, setSiteImage, SITE_IMAGE_KEYS, type SiteImageKey } from '$lib/db/repositories/site-images';
import { listImages } from '$lib/server/admin/images';

export const load: PageServerLoad = async () => {
  const [siteImagesMap, images] = await Promise.all([getSiteImages(db), listImages()]);
  return { siteImagesMap, images };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const key = data.get('key') as string | null;
    const filename = (data.get('filename') as string | null) || null;

    if (!key || !SITE_IMAGE_KEYS.includes(key as SiteImageKey)) {
      return fail(400, { error: 'invalid_key' });
    }

    await setSiteImage(db, key as SiteImageKey, filename);

    const [siteImagesMap, images] = await Promise.all([getSiteImages(db), listImages()]);
    return { siteImagesMap, images, saved: key };
  }
};
