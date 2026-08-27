import { describe, expect, it, vi } from 'vitest';
import {
  MetaLeadIntegrationError,
  extractMetaLeadNotifications,
  fetchMetaLead,
  normalizeMetaLead,
  retrieveAndIngestMetaLeads,
  secureTokenEquals,
  verifyMetaWebhookSignature,
  type MetaLeadNotification
} from '../../src/lib/server/integrations/meta-leads';

const encoder = new TextEncoder();

async function signature(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return `sha256=${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`;
}

const notification: MetaLeadNotification = {
  leadId: '1514307796630470',
  pageId: '1205337539326627',
  formId: '1293909486000385',
  adId: '111111111111111',
  adsetId: '222222222222222',
  createdTime: 1_753_000_000
};

const graphLead = {
  id: notification.leadId,
  created_time: '2026-07-28T10:00:00+0000',
  form_id: notification.formId,
  campaign_id: '333333333333333',
  campaign_name: 'DPFLAB ET Leads',
  adset_id: notification.adsetId,
  adset_name: 'Harjumaa',
  ad_id: notification.adId,
  ad_name: 'DPF diagnostics',
  is_organic: false,
  platform: 'facebook',
  field_data: [
    { name: 'full_name', values: ['Test Person'] },
    { name: 'phone_number', values: ['+372 5555 0000'] },
    { name: 'service_type', values: ['dpf'] },
    { name: 'filter_state', values: ['removed'] },
    { name: 'client_type', values: ['workshop'] },
    { name: 'registration_number', values: ['123 abc'] },
    { name: 'urgency', values: ['today'] },
    { name: 'custom-question', values: ['Answer'] },
    { name: '__proto__', values: ['unsafe'] }
  ]
};

describe('Meta Lead Ads integration', () => {
  it('verifies X-Hub-Signature-256 against the exact raw body', async () => {
    const body = '{"object":"page","entry":[]}';
    const secret = 'app-secret-for-tests';

    expect(
      await verifyMetaWebhookSignature(
        encoder.encode(body).buffer,
        await signature(body, secret),
        secret
      )
    ).toBe(true);
    expect(
      await verifyMetaWebhookSignature(
        encoder.encode(`${body}\n`).buffer,
        await signature(body, secret),
        secret
      )
    ).toBe(false);
    expect(await verifyMetaWebhookSignature(encoder.encode(body).buffer, null, secret)).toBe(false);
  });

  it('compares GET verification tokens without accepting a near match', async () => {
    expect(await secureTokenEquals('a-private-verify-token', 'a-private-verify-token')).toBe(true);
    expect(await secureTokenEquals('a-private-verify-tokeN', 'a-private-verify-token')).toBe(false);
  });

  it('extracts leadgen changes, uses adgroup_id as ad set ID and deduplicates retries', () => {
    const change = {
      field: 'leadgen',
      value: {
        leadgen_id: notification.leadId,
        page_id: notification.pageId,
        form_id: notification.formId,
        ad_id: notification.adId,
        adgroup_id: notification.adsetId,
        created_time: notification.createdTime
      }
    };
    const extracted = extractMetaLeadNotifications(
      {
        object: 'page',
        entry: [{ id: notification.pageId, changes: [change, change, { field: 'feed', value: {} }] }]
      },
      notification.pageId
    );

    expect(extracted).toEqual([notification]);
  });

  it('rejects signed lead notifications for an unexpected Page', () => {
    expect(() =>
      extractMetaLeadNotifications(
        {
          object: 'page',
          entry: [{
            id: '999999999999999',
            changes: [{
              field: 'leadgen',
              value: {
                leadgen_id: notification.leadId,
                page_id: '999999999999999',
                form_id: notification.formId
              }
            }]
          }]
        },
        notification.pageId
      )
    ).toThrowError(expect.objectContaining({ code: 'unexpected_page' }));
  });

  it('normalizes standard and custom fields into the CRM contract', () => {
    const normalized = normalizeMetaLead(graphLead, notification, {
      receivedAt: new Date('2026-07-28T10:05:00Z'),
      formLocales: { [notification.formId]: 'et' }
    });

    expect(normalized).toMatchObject({
      provider: 'meta',
      source: 'meta_instant_form',
      idempotencyKey: `meta:lead:${notification.leadId}`,
      externalLeadId: notification.leadId,
      locale: 'et',
      fullName: 'Test Person',
      phone: '+372 5555 0000',
      serviceType: 'dpf',
      filterState: 'removed',
      clientType: 'workshop',
      registrationNumber: '123 abc',
      urgency: 'today',
      createdAt: '2026-07-28T10:00:00.000Z',
      receivedAt: '2026-07-28T10:05:00.000Z'
    });
    expect(normalized.standardFields).toEqual({
      full_name: ['Test Person'],
      phone_number: ['+372 5555 0000']
    });
    expect(normalized.customFields.custom_question).toEqual(['Answer']);
    expect((Object.prototype as unknown as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('fetches v25.0 fields with a bearer token and appsecret_proof, never a token query param', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(graphLead));
    const result = await fetchMetaLead(
      notification,
      {
        META_LEADS_ACCESS_TOKEN: 'private-page-token',
        META_APP_SECRET: 'private-app-secret',
        META_GRAPH_API_VERSION: 'v25.0'
      },
      fetcher
    );

    expect(result.id).toBe(notification.leadId);
    const [input, init] = fetcher.mock.calls[0] as [URL, RequestInit];
    expect(input.pathname).toBe(`/v25.0/${notification.leadId}`);
    expect(input.searchParams.get('access_token')).toBeNull();
    expect(input.searchParams.get('appsecret_proof')).toMatch(/^[0-9a-f]{64}$/);
    expect(input.searchParams.get('fields')).toContain('field_data');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer private-page-token');
  });

  it('retrieves and passes an idempotent normalized lead to the sink', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(graphLead));
    const sink = vi.fn().mockResolvedValue({ submissionId: 42, inserted: true });

    const result = await retrieveAndIngestMetaLeads(
      [notification],
      {
        META_LEADS_ACCESS_TOKEN: 'private-page-token',
        META_APP_SECRET: 'private-app-secret',
        META_LEADS_FORM_LOCALES: JSON.stringify({ [notification.formId]: 'et' })
      },
      sink,
      { fetcher, receivedAt: new Date('2026-07-28T10:05:00Z') }
    );

    expect(result).toEqual([{ submissionId: 42, inserted: true }]);
    expect(sink).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: `meta:lead:${notification.leadId}`,
      externalLeadId: notification.leadId,
      source: 'meta_instant_form'
    }));
  });

  it('does not expose Graph response details in thrown errors', async () => {
    const error = await fetchMetaLead(
      notification,
      { META_LEADS_ACCESS_TOKEN: 'token', META_APP_SECRET: 'secret' },
      vi.fn().mockResolvedValue(Response.json({
        error: { message: 'PII and token must not propagate' }
      }, { status: 400 }))
    ).catch((cause) => cause);

    expect(error).toBeInstanceOf(MetaLeadIntegrationError);
    expect(error.message).toBe('graph_request_failed');
    expect(String(error)).not.toContain('PII and token');
  });
});
