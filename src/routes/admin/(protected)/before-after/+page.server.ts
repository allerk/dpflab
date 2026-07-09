import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/db/index';
import {
  getBeforeAfterRows,
  createBeforeAfterItem,
  deleteBeforeAfterItem,
  reorderBeforeAfterItem
} from '$lib/db/repositories/before-after';
import { listImages } from '$lib/server/admin/images';

export const load: PageServerLoad = async ({ platform }) => {
  const db = getDb(platform);
  const [rows, images] = await Promise.all([getBeforeAfterRows(db), listImages(platform)]);
  return { rows, images };
};

export const actions: Actions = {
  create: async ({ request, platform }) => {
    const db = getDb(platform);
    const data = await request.formData();
    // currently disabled feature, so it's always false
    // const sliderEnabled = data.get('slider_enabled') === 'on';
    const sliderEnabled = false;
    const imageBefore = (data.get('image_before') as string)?.trim() || null;
    const imageAfter = (data.get('image_after') as string)?.trim() || null;
    await createBeforeAfterItem(db, { sliderEnabled, imageBefore, imageAfter });
    return { rows: await getBeforeAfterRows(db) };
  },

  delete: async ({ request, platform }) => {
    const db = getDb(platform);
    const data = await request.formData();
    const id = Number(data.get('id'));
    if (!id) return fail(400, { error: true });
    await deleteBeforeAfterItem(db, id);
    return { rows: await getBeforeAfterRows(db) };
  },

  moveUp: async ({ request, platform }) => {
    const db = getDb(platform);
    const data = await request.formData();
    await reorderBeforeAfterItem(db, Number(data.get('id')), 'up');
    return { rows: await getBeforeAfterRows(db) };
  },

  moveDown: async ({ request, platform }) => {
    const db = getDb(platform);
    const data = await request.formData();
    await reorderBeforeAfterItem(db, Number(data.get('id')), 'down');
    return { rows: await getBeforeAfterRows(db) };
  }
};
