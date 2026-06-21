import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  getContactSubmissions,
  deleteContactSubmission
} from '$lib/db/repositories/contact-submissions.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const rows = await getContactSubmissions(db);
  return { rows };
};

export const actions: Actions = {
  delete: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await deleteContactSubmission(db, id);
    console.info(`[admin] action=delete domain=submissions id=${id} email=${email}`);
    redirect(303, '/admin/submissions');
  }
};
