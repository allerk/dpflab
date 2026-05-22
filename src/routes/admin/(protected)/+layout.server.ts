import type { LayoutServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';

export const load: LayoutServerLoad = (event) => {
  const { email } = requireAdmin(event);
  return { adminEmail: email };
};
