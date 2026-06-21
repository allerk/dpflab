import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import type { Db } from './types';

/**
 * Builds a Drizzle client bound to the request-scoped Cloudflare D1 binding.
 * On Workers there is no long-lived connection — the DB arrives per request via
 * `event.platform.env.DB`. Migrations are applied out-of-band with
 * `wrangler d1 migrations apply` (D1 has no runtime migrate()).
 */
export function getDb(platform: App.Platform | undefined): Db {
  const d1 = platform?.env?.DB;
  if (!d1) {
    throw new Error('D1 binding "DB" is not available on platform.env');
  }
  return drizzle(d1, { schema });
}
