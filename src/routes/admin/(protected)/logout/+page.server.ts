import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ cookies }) => {
    cookies.delete('admin_session', { path: '/' });
    redirect(303, '/admin/login');
  }
};
