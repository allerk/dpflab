import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { verifySession } from '$lib/server/admin/session.js';
import { isWhitelisted } from '$lib/server/admin/whitelist.js';

const paraglideHandle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest;
    event.locals.locale = locale;
    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace('%lang%', locale).replace('%dir%', getTextDirection(locale))
    });
  });

const adminGuardHandle: Handle = async ({ event, resolve }) => {
  // Resolve session from cookie
  const token = event.cookies.get('admin_session');
  const secret = env.ADMIN_SESSION_SECRET;

  if (token && secret) {
    const session = verifySession(token, secret);
    if (session) {
      event.locals.admin = { email: session.email };
    }
  }

  // After paraglide, event.request.url has the canonical (de-localized) path
  const canonicalPath = new URL(event.request.url).pathname;

  if (!canonicalPath.startsWith('/admin')) {
    return resolve(event);
  }

  // Login page is public — pass through with no-cache
  if (canonicalPath.startsWith('/admin/login')) {
    const response = await resolve(event);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  if (!event.locals.admin) {
    const localePrefix = event.url.pathname.startsWith('/et') ? '/et' : '';
    redirect(302, `${localePrefix}/admin/login?return=${encodeURIComponent(event.url.pathname)}`);
  }

  if (!isWhitelisted(event.locals.admin.email, env.ADMIN_WHITELIST)) {
    console.warn(
      `[admin] ${new Date().toISOString()} non-whitelisted ${event.locals.admin.email} path=${event.url.pathname}`
    );
    event.cookies.delete('admin_session', { path: '/' });
    event.locals.admin = undefined;
    error(403, 'Access denied');
  }

  const response = await resolve(event);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};

export const handle: Handle = sequence(paraglideHandle, adminGuardHandle);
