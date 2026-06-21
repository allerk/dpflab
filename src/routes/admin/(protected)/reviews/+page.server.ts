import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  getReviewRows,
  createReview,
  deleteReview,
  reorderReview
} from '$lib/db/repositories/reviews.js';

const LOCALES = ['ru', 'et'] as const;

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const rows = await getReviewRows(db);
  return { rows };
};

export const actions: Actions = {
  create: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
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

    await createReview(db, { stars, text, author, locale });
    console.info(`[admin] action=create domain=reviews email=${email}`);
    redirect(303, '/admin/reviews');
  },

  delete: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await deleteReview(db, id);
    console.info(`[admin] action=delete domain=reviews id=${id} email=${email}`);
    redirect(303, '/admin/reviews');
  },

  moveUp: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderReview(db, id, 'up');
    console.info(`[admin] action=moveUp domain=reviews id=${id} email=${email}`);
    redirect(303, '/admin/reviews');
  },

  moveDown: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderReview(db, id, 'down');
    console.info(`[admin] action=moveDown domain=reviews id=${id} email=${email}`);
    redirect(303, '/admin/reviews');
  }
};
