import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { isWhitelisted } from './whitelist.js';

export function requireAdmin(event: RequestEvent): { email: string } {
  if (!event.locals.admin) {
    error(401, 'Unauthorized');
  }
  if (!isWhitelisted(event.locals.admin.email, event.platform?.env?.ADMIN_WHITELIST)) {
    console.warn(
      `[admin] ${new Date().toISOString()} non-whitelisted ${event.locals.admin.email} path=${event.url.pathname}`
    );
    error(403, 'Access denied');
  }
  return { email: event.locals.admin.email };
}
