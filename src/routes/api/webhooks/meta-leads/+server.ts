import { json, text, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db';
import { ingestMetaLead } from '$lib/db/repositories/meta-leads.js';
import {
  MetaLeadIntegrationError,
  extractMetaLeadNotifications,
  retrieveAndIngestMetaLeads,
  secureTokenEquals,
  verifyMetaWebhookSignature,
  type MetaLeadWebhookEnv
} from '$lib/server/integrations/meta-leads';

const MAX_WEBHOOK_BYTES = 1_048_576;
const NO_STORE_HEADERS = { 'cache-control': 'no-store, max-age=0' };

const webhookEnv = (platform: App.Platform | undefined): MetaLeadWebhookEnv | undefined =>
  platform?.env as (MetaLeadWebhookEnv & object) | undefined;

export const GET: RequestHandler = async ({ request, platform }) => {
  const env = webhookEnv(platform);
  const verifyToken = env?.META_LEADS_VERIFY_TOKEN?.trim();
  if (!verifyToken) return text('Unavailable', { status: 503, headers: NO_STORE_HEADERS });

  const url = new URL(request.url);
  const verified =
    url.searchParams.get('hub.mode') === 'subscribe' &&
    (await secureTokenEquals(url.searchParams.get('hub.verify_token'), verifyToken));
  if (!verified) return text('Forbidden', { status: 403, headers: NO_STORE_HEADERS });

  const challenge = url.searchParams.get('hub.challenge');
  if (!challenge || challenge.length > 1_024) {
    return text('Bad Request', { status: 400, headers: NO_STORE_HEADERS });
  }
  return text(challenge, { headers: NO_STORE_HEADERS });
};

export const POST: RequestHandler = async ({ request, platform }) => {
  const env = webhookEnv(platform);
  const appSecret = env?.META_APP_SECRET?.trim();
  const pageId = env?.META_LEADS_PAGE_ID?.trim();
  if (!env || !appSecret || !env.META_LEADS_ACCESS_TOKEN?.trim() || !/^\d{5,40}$/.test(pageId ?? '')) {
    return json({ received: false, error: 'integration_unavailable' }, {
      status: 503,
      headers: NO_STORE_HEADERS
    });
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BYTES) {
    return json({ received: false, error: 'payload_too_large' }, {
      status: 413,
      headers: NO_STORE_HEADERS
    });
  }

  let rawBody: ArrayBuffer;
  try {
    rawBody = await request.arrayBuffer();
  } catch {
    return json({ received: false, error: 'invalid_body' }, {
      status: 400,
      headers: NO_STORE_HEADERS
    });
  }
  if (rawBody.byteLength > MAX_WEBHOOK_BYTES) {
    return json({ received: false, error: 'payload_too_large' }, {
      status: 413,
      headers: NO_STORE_HEADERS
    });
  }

  const validSignature = await verifyMetaWebhookSignature(
    rawBody,
    request.headers.get('x-hub-signature-256'),
    appSecret
  );
  if (!validSignature) {
    return json({ received: false, error: 'invalid_signature' }, {
      status: 401,
      headers: NO_STORE_HEADERS
    });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return json({ received: false, error: 'invalid_json' }, {
      status: 400,
      headers: NO_STORE_HEADERS
    });
  }

  try {
    const notifications = extractMetaLeadNotifications(payload, pageId!);
    if (!notifications.length) {
      return json({ received: true, processed: 0, inserted: 0, duplicates: 0 }, {
        headers: NO_STORE_HEADERS
      });
    }

    const db = getDb(platform);
    const results = await retrieveAndIngestMetaLeads(
      notifications,
      env,
      (lead) => ingestMetaLead(db, lead)
    );
    const inserted = results.filter((result) => result.inserted).length;
    return json({
      received: true,
      processed: results.length,
      inserted,
      duplicates: results.length - inserted
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const code = error instanceof MetaLeadIntegrationError ? error.code : 'ingestion_failed';
    // Never log request bodies, Graph response bodies, tokens, lead IDs or contact details.
    console.error(`[meta-leads] webhook processing failed code=${code}`);
    return json({ received: false, error: 'processing_failed' }, {
      status: 502,
      headers: NO_STORE_HEADERS
    });
  }
};
