import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { db } from '$lib/db/index.js';
import { getReviewRows, updateReview } from '$lib/db/repositories/reviews.js';

const LOCALES = ['ru', 'et'] as const;

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const id = parseInt(event.params.id, 10);
  if (isNaN(id)) error(404, 'Not found');

  const rows = await getReviewRows(db);
  const row = rows.find((r) => r.id === id);
  if (!row) error(404, 'Not found');

  return {
    row: {
      id: row.id,
      stars: row.stars,
      text: row.text,
      locale: row.locale,
      author: row.author
    }
  };
};

export const actions: Actions = {
  update: async (event) => {
    const { email } = requireAdmin(event);
    const id = parseInt(event.params.id, 10);
    if (isNaN(id)) error(404, 'Not found');

    const data = await event.request.formData();
    const starsRaw = (data.get('stars') as string)?.trim() ?? '';
    const text = (data.get('text') as string)?.trim() ?? '';
    const locale = (data.get('locale') as string)?.trim() ?? '';
    const author = (data.get('author') as string)?.trim() ?? '';

    const stars = parseInt(starsRaw, 10);
    const errors: Record<string, string> = {};
    if (isNaN(stars) || stars < 1 || stars > 5) errors.stars = 'required';
    if (!text) errors.text = 'required';
    if (!LOCALES.includes(locale as (typeof LOCALES)[number])) errors.locale = 'required';
    if (!author) errors.author = 'required';

    if (Object.keys(errors).length) {
      return fail(400, { errors, values: { starsRaw, text, locale, author } });
    }

    await updateReview(db, id, { stars, text, author, locale });
    console.info(`[admin] action=update domain=reviews id=${id} email=${email}`);
    redirect(303, '/admin/reviews');
  }
};
