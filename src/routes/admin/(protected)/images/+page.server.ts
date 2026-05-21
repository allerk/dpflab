import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { unlink, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import { listImages, ALLOWED_EXT } from '$lib/server/admin/images';
import { db } from '$lib/db/index';
import { getBeforeAfterRows } from '$lib/db/repositories/before-after';

const IMAGES_DIR = resolve(process.cwd(), 'data/images');
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const load: PageServerLoad = async () => {
  return { files: await listImages() };
};

export const actions: Actions = {
  upload: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file || file.size === 0) return fail(400, { error: 'no_file' });
    if (file.size > MAX_SIZE) return fail(400, { error: 'too_large' });

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return fail(400, { error: 'bad_type' });

    const filename = basename(file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());

    await mkdir(IMAGES_DIR, { recursive: true });
    await writeFile(resolve(IMAGES_DIR, filename), bytes);

    return { files: await listImages() };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const filename = basename((data.get('filename') as string) ?? '');
    if (!filename) return fail(400, { error: 'no_filename' });

    const ext = extname(filename).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return fail(400, { error: 'bad_type' });

    const baRows = await getBeforeAfterRows(db);
    const usedIn = baRows
      .filter((r) => r.imageBefore === filename || r.imageAfter === filename)
      .map((r) => `Before/After #${r.id}`);

    if (usedIn.length > 0) {
      return fail(400, { error: 'in_use', filename, usedIn, files: await listImages() });
    }

    try {
      await unlink(resolve(IMAGES_DIR, filename));
    } catch {
      // already gone — not an error
    }

    return { files: await listImages() };
  }
};
