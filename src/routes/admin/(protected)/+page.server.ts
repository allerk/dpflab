import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';

export const load: PageServerLoad = (event) => {
  requireAdmin(event);
  return {};
};
