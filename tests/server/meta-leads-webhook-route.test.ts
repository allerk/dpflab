import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ingestMetaLead: vi.fn(),
  getDb: vi.fn(() => ({ kind: 'mock-db' }))
}));

vi.mock('$lib/db', () => ({ getDb: mocks.getDb }));
vi.mock('$lib/db/repositories/meta-leads.js', () => ({
  ingestMetaLead: mocks.ingestMetaLead
}));
vi.mock('$lib/server/integrations/meta-leads', async () =>
  import('../../src/lib/server/integrations/meta-leads')
);

import { GET, POST } from '../../src/routes/api/webhooks/meta-leads/+server';

const encoder = new TextEncoder();
const appSecret = 'route-test-app-secret';
const verifyToken = 'route-test-verify-token';
const pageId = '1205337539326627';
const formId = '1514307796630470';
const leadId = '1999999999999999';

const platform = {
  env: {
    DB: {},
    META_APP_SECRET: appSecret,
    META_LEADS_ACCESS_TOKEN: 'private-page-access-token',
    META_LEADS_VERIFY_TOKEN: verifyToken,
    META_LEADS_PAGE_ID: pageId,
    META_LEADS_FORM_LOCALES: JSON.stringify({ [formId]: 'ru' }),
    META_GRAPH_API_VERSION: 'v25.0'
  }
};

async function signature(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return `sha256=${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`;
}

const call = (
  handler: typeof GET | typeof POST,
  request: Request
): Promise<Response> => handler({ request, platform } as never) as Promise<Response>;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Meta Lead Ads webhook route', () => {
  it('answers the Meta GET verification challenge without cacheable headers', async () => {
    const request = new Request(
      `https://dpflab.ee/api/webhooks/meta-leads?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=challenge-123`
    );

    const response = await call(GET, request);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('challenge-123');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('rejects a GET challenge with the wrong verification token', async () => {
    const request = new Request(
      'https://dpflab.ee/api/webhooks/meta-leads?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=test'
    );

    const response = await call(GET, request);

    expect(response.status).toBe(403);
  });

  it('rejects a POST before parsing or fetching when its signature is invalid', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const request = new Request('https://dpflab.ee/api/webhooks/meta-leads', {
      method: 'POST',
      headers: { 'x-hub-signature-256': `sha256=${'0'.repeat(64)}` },
      body: '{not valid json'
    });

    const response = await call(POST, request);

    expect(response.status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
    expect(mocks.ingestMetaLead).not.toHaveBeenCalled();
  });

  it('retrieves and ingests a valid signed leadgen delivery', async () => {
    const body = JSON.stringify({
      object: 'page',
      entry: [{
        id: pageId,
        changes: [{
          field: 'leadgen',
          value: {
            leadgen_id: leadId,
            page_id: pageId,
            form_id: formId,
            ad_id: '1888888888888888',
            adgroup_id: '1777777777777777',
            created_time: 1_753_700_000
          }
        }]
      }]
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      id: leadId,
      form_id: formId,
      created_time: '2026-07-28T10:00:00+0000',
      campaign_id: '1666666666666666',
      field_data: [
        { name: 'full_name', values: ['Test Person'] },
        { name: 'phone_number', values: ['+372 5555 0000'] },
        { name: 'service_type', values: ['dpf'] }
      ]
    })));
    mocks.ingestMetaLead.mockResolvedValue({ submissionId: 42, inserted: true });
    const request = new Request('https://dpflab.ee/api/webhooks/meta-leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': await signature(body)
      },
      body
    });

    const response = await call(POST, request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      processed: 1,
      inserted: 1,
      duplicates: 0
    });
    expect(mocks.getDb).toHaveBeenCalledOnce();
    expect(mocks.ingestMetaLead).toHaveBeenCalledWith(
      { kind: 'mock-db' },
      expect.objectContaining({
        externalLeadId: leadId,
        formId,
        pageId,
        locale: 'ru',
        fullName: 'Test Person',
        phone: '+372 5555 0000',
        serviceType: 'dpf'
      })
    );
  });
});
