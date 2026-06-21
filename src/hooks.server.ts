import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { error } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { getAccessEmail } from '$lib/server/admin/access';

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
  // Identity comes from Cloudflare Access (verified JWT) or the local-dev bypass.
  const email = await getAccessEmail(event.request, event.platform?.env);
  if (email) {
    event.locals.admin = { email };
  }

  // After paraglide, event.request.url has the canonical (de-localized) path
  const canonicalPath = new URL(event.request.url).pathname;
  if (!canonicalPath.startsWith('/admin')) {
    return resolve(event);
  }

  // Access blocks unauthenticated requests at the edge; this is defense in depth
  // for any request that reaches the Worker without a valid identity.
  if (!event.locals.admin) {
    error(403, 'Access denied');
  }

  const response = await resolve(event);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};

export const handle: Handle = sequence(paraglideHandle, adminGuardHandle);
