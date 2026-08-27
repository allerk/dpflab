import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/db';
import { processCrmOutbox, reconcileCrmOutbox } from '$lib/server/crm/outbox';

const digest = async (value: string) =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));

const safeEqual = async (left: string, right: string) => {
  const [a, b] = await Promise.all([digest(left), digest(right)]);
  let different = 0;
  for (let index = 0; index < a.length; index += 1) different |= a[index] ^ b[index];
  return different === 0;
};

export const POST: RequestHandler = async (event) => {
  const expected = event.platform?.env?.CRM_CRON_TOKEN?.trim() ?? '';
  const supplied = event.request.headers.get('x-crm-cron-token')?.trim() ?? '';
  if (expected.length < 32 || supplied.length < 32 || !(await safeEqual(expected, supplied))) {
    return json({ error: 'not_found' }, { status: 404 });
  }

  const db = getDb(event.platform);
  const reconciled = await reconcileCrmOutbox(db);
  const deliveries = await processCrmOutbox(db, event.platform?.env ?? {}, { limit: 100 });
  return json({ reconciled, deliveries });
};
