import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { basename, extname } from 'node:path';
import { listImages, ALLOWED_EXT, contentTypeFor } from '$lib/server/admin/images';
import { getDb } from '$lib/db/index';
import { getBeforeAfterRows } from '$lib/db/repositories/before-after';
import { getSiteImages } from '$lib/db/repositories/site-images';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const load: PageServerLoad = async ({ platform }) => {
  return { files: await listImages(platform) };
};

export const actions: Actions = {
  upload: async ({ request, platform }) => {
    const bucket = platform?.env?.BUCKET;
    if (!bucket) return fail(500, { error: 'no_bucket' });

    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file || file.size === 0) return fail(400, { error: 'no_file' });
    if (file.size > MAX_SIZE) return fail(400, { error: 'too_large' });

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return fail(400, { error: 'bad_type' });

    const filename = basename(file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());

    await bucket.put(filename, bytes, {
      httpMetadata: { contentType: contentTypeFor(filename) }
    });

    return { files: await listImages(platform) };
  },

  delete: async ({ request, platform }) => {
    const bucket = platform?.env?.BUCKET;
    if (!bucket) return fail(500, { error: 'no_bucket' });
    const db = getDb(platform);

    const data = await request.formData();
    const filename = basename((data.get('filename') as string) ?? '');
    if (!filename) return fail(400, { error: 'no_filename' });

    const ext = extname(filename).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return fail(400, { error: 'bad_type' });

    const [baRows, siteImagesMap] = await Promise.all([getBeforeAfterRows(db), getSiteImages(db)]);
    const usedIn: string[] = [
      ...baRows
        .filter((r) => r.imageBefore === filename || r.imageAfter === filename)
        .map((r) => `Before/After #${r.id}`),
      ...Object.entries(siteImagesMap)
        .filter(([, v]) => v === filename)
        .map(([k]) => `Site image: ${k}`)
    ];

    if (usedIn.length > 0) {
      return fail(400, { error: 'in_use', filename, usedIn, files: await listImages(platform) });
    }

    await bucket.delete(filename);

    return { files: await listImages(platform) };
  }
};
