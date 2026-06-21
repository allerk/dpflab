import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

/**
 * Asserts the request carries an authenticated admin identity (set by the
 * Cloudflare Access hook). The allow-list is enforced by the Access policy at
 * the edge, so there is no per-email check here.
 */
export function requireAdmin(event: RequestEvent): { email: string } {
  if (!event.locals.admin) {
    error(403, 'Access denied');
  }
  return { email: event.locals.admin.email };
}
