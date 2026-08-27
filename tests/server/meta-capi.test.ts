import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  sendMetaCrmEvent,
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
    expect(url).not.toContain('secret-token');
    expect(new Headers(options.headers).get('authorization')).toBe('Bearer secret-token');
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

  it('uses system_generated and raw lead_id for enabled Instant Form feedback', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendMetaCrmEvent(
      {
        stage: 'booked',
        eventId: 'crm-lead-77-booked',
        occurredAt: '2026-08-10T12:00:00.000Z',
        origin: 'meta_instant',
        externalLeadId: '1514307796630470',
        name: 'Test', phone: '', email: '', locale: 'et', serviceType: 'dpf',
        analyticsConsent: false,
        orderAmountCents: 0
      },
      {
        META_PIXEL_ID: '1358232535765480',
        META_CAPI_TOKEN: 'secret-token',
        META_CRM_EVENTS_ENABLED: 'true'
      }
    );

    expect(result.outcome).toBe('delivered');
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const event = JSON.parse(String(options.body)).data[0];
    expect(event).toMatchObject({
      event_name: 'Schedule',
      action_source: 'system_generated',
      user_data: { lead_id: '1514307796630470' },
      custom_data: { event_source: 'crm' }
    });
    expect(event.event_source_url).toBeUndefined();
  });

  it('keeps Instant Form feedback deferred until the explicit launch gate is enabled', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await sendMetaCrmEvent(
      {
        stage: 'qualified', eventId: 'crm-lead-77-qualified', occurredAt: Date.now(),
        origin: 'meta_instant', externalLeadId: '1514307796630470',
        name: '', phone: '', email: '', locale: 'ru', serviceType: 'dpf',
        analyticsConsent: false, orderAmountCents: 0
      },
      { META_PIXEL_ID: '1358232535765480', META_CAPI_TOKEN: 'secret-token' }
    );
    expect(result).toEqual({ outcome: 'deferred', acknowledge: false, reason: 'policy_not_enabled' });
    expect(fetchMock).not.toHaveBeenCalled();
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
      action_source: 'system_generated',
      custom_data: {
        currency: 'EUR',
        value: 199
      }
    });
    expect(body.data[0].user_data.client_ip_address).toBeUndefined();
    expect(body.data[0].user_data.client_user_agent).toBeUndefined();
    expect(body.data[0].event_source_url).toBeUndefined();
  });

  it('retries Graph 400 responses explicitly marked transient', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: { is_transient: true, code: 2 } }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    )));
    const result = await sendMetaCrmEvent(
      {
        stage: 'qualified', eventId: 'crm-lead-91-qualified', occurredAt: Date.now(),
        origin: 'meta_instant', externalLeadId: '1514307796630470',
        name: '', phone: '', email: '', locale: 'ru', serviceType: 'dpf',
        analyticsConsent: false, orderAmountCents: 0
      },
      { META_PIXEL_ID: '1358232535765480', META_CAPI_TOKEN: 'token', META_CRM_EVENTS_ENABLED: 'true' }
    );
    expect(result).toMatchObject({ outcome: 'failed', retryable: true, httpStatus: 400 });
  });
});
