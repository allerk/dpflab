import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
  // Cloudflare Access owns the session — log out at its endpoint, which clears
  // the Access cookie and returns the user to the identity provider.
  default: async () => {
    redirect(303, '/cdn-cgi/access/logout');
  }
};
