import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { error } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { getAccessEmail } from '$lib/server/admin/access';
import { publicCacheUrl } from '$lib/server/cache-key';

// Minimal view of the Cloudflare edge cache (`caches.default`), which — unlike a
// plain Cache-Control header — is what actually caches Worker-generated responses
// at the edge between visitors.
type EdgeCache = {
  match(req: Request): Promise<Response | undefined>;
  put(req: Request, res: Response): Promise<void>;
};

const environmentHeadersHandle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  if (event.platform?.env?.APP_ENV !== 'develop') return response;

  const developResponse = new Response(response.body, response);
  developResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return developResponse;
};

/**
 * Edge-caches public GET pages by URL. Locale is URL-based (`/` ru, `/et` et,
 * strategy ['url','baseLocale']). Advertising identifiers do not affect HTML and
 * are removed from the cache key so each click does not create a separate object.
 * Develop, admin and non-GET requests bypass the cache.
 */
const edgeCacheHandle: Handle = async ({ event, resolve }) => {
  const pathname = new URL(event.request.url).pathname;
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/et/admin');
  if (
    event.request.method !== 'GET' ||
    isAdmin ||
    event.platform?.env?.APP_ENV === 'develop'
  ) {
    return resolve(event);
  }

  const cache = (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default;
  if (!cache) return resolve(event);

  const cacheKey = new Request(publicCacheUrl(event.request.url), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const response = await resolve(event);
  if (response.status !== 200) return response;

  // Re-wrap so headers are mutable, then store a clone (TTL on the edge).
  const res = new Response(response.body, response);
  res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  const put = cache.put(cacheKey, res.clone());
  if (event.platform?.context?.waitUntil) event.platform.context.waitUntil(put);
  else await put;
  return res;
};

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

export const handle: Handle = sequence(
  environmentHeadersHandle,
  edgeCacheHandle,
  paraglideHandle,
  adminGuardHandle
);
