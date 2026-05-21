import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/index';
import { getBeforeAfterRows, updateBeforeAfterItem } from '$lib/db/repositories/before-after';

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.id);
  const rows = await getBeforeAfterRows(db);
  const row = rows.find((r) => r.id === id);
  if (!row) error(404);
  return { row };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const id = Number(params.id);
    const data = await request.formData();
    const sliderEnabled = data.get('slider_enabled') === 'on';
    const imageBefore = (data.get('image_before') as string)?.trim() || null;
    const imageAfter = (data.get('image_after') as string)?.trim() || null;
    await updateBeforeAfterItem(db, id, { sliderEnabled, imageBefore, imageAfter });
    redirect(303, '/admin/before-after');
  }
};
