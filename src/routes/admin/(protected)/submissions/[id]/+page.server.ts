import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  getContactSubmission,
  deleteContactSubmission
} from '$lib/db/repositories/contact-submissions.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const id = Number(event.params.id);
  if (!Number.isInteger(id) || id < 1) error(404, 'Not found');

  const db = getDb(event.platform);
  const row = await getContactSubmission(db, id);
  if (!row) error(404, 'Not found');

  return { row };
};

export const actions: Actions = {
  delete: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = Number(event.params.id);
    if (!Number.isInteger(id) || id < 1) return fail(400, { error: 'Invalid id' });

    await deleteContactSubmission(db, id);
    console.info(`[admin] action=delete domain=submissions id=${id} email=${email}`);
    redirect(303, '/admin/submissions');
  }
};
