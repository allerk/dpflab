import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  scheduleMetaLeadEvent,
  scheduleMetaPipelineEvent
} from '../../src/lib/server/analytics/meta-capi';

const input = {
  eventId: 'site-lead-42',
  request: new Request('https://dpflab.ee/?utm_source=meta', {
    headers: {
      'user-agent': 'Vitest',
      'CF-Connecting-IP': '203.0.113.10'
    }
  }),
  name: 'Test User',
  phone: '+372 5555 5014',
  email: 'TEST@EXAMPLE.COM',
  locale: 'ru',
  serviceType: 'dpf',
  fbp: 'fb.1.1234567890.123456789',
  fbc: 'fb.1.1234567890.click',
  analyticsConsent: true
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Meta CAPI', () => {
  it('sends a deduplicated Lead event with hashed user data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await scheduleMetaLeadEvent({
      ...input,
      env: {
        META_PIXEL_ID: '1358232535765480',
        META_CAPI_TOKEN: 'secret-token',
        META_GRAPH_API_VERSION: 'v25.0'
      }
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/v25.0/1358232535765480/events');
    const body = JSON.parse(String(options.body));
    expect(body.data[0]).toMatchObject({
      event_name: 'Lead',
      event_id: 'site-lead-42',
      action_source: 'website'
    });
    expect(body.data[0].user_data.ph[0]).not.toContain('55555014');
    expect(body.data[0].user_data.em[0]).not.toContain('test@example.com');
    expect(body.data[0].user_data).toMatchObject({
      fbp: input.fbp,
      fbc: input.fbc,
      client_ip_address: '203.0.113.10',
      client_user_agent: 'Vitest'
    });
  });

  it('does not send marketing data without consent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await scheduleMetaLeadEvent({
      ...input,
      analyticsConsent: false,
      env: {
        META_PIXEL_ID: '1358232535765480',
        META_CAPI_TOKEN: 'secret-token'
      }
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends completed revenue as a deduplicated Purchase event', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await scheduleMetaPipelineEvent({
      stage: 'completed',
      submissionId: 42,
      request: input.request,
      landingPage: '/en?utm_source=meta',
      name: input.name,
      phone: input.phone,
      email: input.email,
      locale: input.locale,
      serviceType: input.serviceType,
      fbp: input.fbp,
      fbc: input.fbc,
      analyticsConsent: true,
      orderAmountCents: 19_900,
      env: {
        META_PIXEL_ID: '1358232535765480',
        META_CAPI_TOKEN: 'secret-token',
        META_GRAPH_API_VERSION: 'v25.0'
      }
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(options.body));
    expect(body.data[0]).toMatchObject({
      event_name: 'Purchase',
      event_id: 'site-lead-42-completed',
      event_source_url: 'https://dpflab.ee/en?utm_source=meta',
      custom_data: {
        currency: 'EUR',
        value: 199
      }
    });
    expect(body.data[0].user_data.client_ip_address).toBeUndefined();
    expect(body.data[0].user_data.client_user_agent).toBeUndefined();
  });
});
