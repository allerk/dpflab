import { describe, expect, it, vi } from 'vitest';
import {
  buildGoogleGa4Payload,
  sendGoogleCrmEvent,
  type GoogleCrmEventInput,
  type GoogleGa4Env
} from '../../src/lib/server/analytics/google-ga4';

const nowMs = Date.parse('2026-08-10T10:00:00.000Z');
const env: GoogleGa4Env = {
  GOOGLE_ANALYTICS_MEASUREMENT_ID: 'G-ABC12345',
  GOOGLE_ANALYTICS_API_SECRET: 'measurement-protocol-secret',
  GOOGLE_ANALYTICS_PSEUDONYM_KEY: '0123456789abcdef0123456789abcdef',
  GOOGLE_CRM_EVENTS_ENABLED: 'true'
};
const base: GoogleCrmEventInput = {
  stage: 'lead_created',
  outboxEventId: 'crm-event-42',
  occurredAt: '2026-08-10T09:58:00.000Z',
  leadKey: 'submission:42',
  analyticsConsent: true,
  clientId: '123456789.1760000000',
  sessionId: '1760000000',
  engagementTimeMsec: 100,
  leadSource: 'google / cpc',
  serviceType: 'dpf_cleaning',
  locale: 'et'
};

describe('Google Analytics CRM events', () => {
  it('maps a new CRM lead to the recommended generate_lead event', async () => {
    const result = await buildGoogleGa4Payload(base, env, { nowMs });

    expect(result.outcome).toBe('ready');
    if (result.outcome !== 'ready') return;
    expect(result.payload).toMatchObject({
      client_id: '123456789.1760000000',
      timestamp_micros: 1786355880000000,
      consent: {
        ad_user_data: 'DENIED',
        ad_personalization: 'DENIED'
      }
    });
    expect(result.payload.events).toEqual([
      {
        name: 'generate_lead',
        params: {
          event_id: 'crm-event-42',
          crm_stage: 'lead_created',
          session_id: '1760000000',
          engagement_time_msec: 100,
          lead_source: 'google / cpc',
          service_type: 'dpf_cleaning',
          lead_locale: 'et',
          items: [{ item_id: 'dpf_cleaning' }]
        }
      }
    ]);
  });

  it('records a completed job as a converted lead and a deduplicated purchase', async () => {
    const result = await buildGoogleGa4Payload(
      {
        ...base,
        stage: 'completed',
        valueCents: 19_900,
        currency: 'eur'
      },
      env,
      { nowMs }
    );

    expect(result.outcome).toBe('ready');
    if (result.outcome !== 'ready') return;
    expect(result.payload.events.map((event) => event.name)).toEqual([
      'close_convert_lead',
      'purchase'
    ]);
    expect(result.payload.events[1].params).toMatchObject({
      transaction_id: 'crm-event-42',
      event_id: 'crm-event-42:purchase',
      currency: 'EUR',
      value: 199,
      items: [{ item_id: 'dpf_cleaning', price: 199, quantity: 1 }]
    });
  });

  it('uses a stable HMAC pseudonym when no browser client ID exists', async () => {
    const first = await buildGoogleGa4Payload({ ...base, clientId: undefined }, env, { nowMs });
    const second = await buildGoogleGa4Payload({ ...base, clientId: undefined }, env, { nowMs });

    expect(first.outcome).toBe('ready');
    expect(second.outcome).toBe('ready');
    if (first.outcome !== 'ready' || second.outcome !== 'ready') return;
    expect(first.payload.client_id).toBe(second.payload.client_id);
    expect(first.payload.client_id).toMatch(/^crm\.[a-f0-9]{64}$/);
    expect(first.payload.client_id).not.toContain(base.leadKey);
  });

  it('acknowledges consent-denied events without sending them', async () => {
    const fetchImpl = vi.fn();

    const result = await sendGoogleCrmEvent(
      { ...base, analyticsConsent: false },
      env,
      { fetchImpl, nowMs }
    );

    expect(result).toEqual({
      outcome: 'skipped',
      acknowledge: true,
      reason: 'consent_denied'
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('sends to the EU collection endpoint and returns an outbox-friendly result', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    const result = await sendGoogleCrmEvent(base, env, { fetchImpl, nowMs });

    expect(result).toEqual({ outcome: 'delivered', acknowledge: true, httpStatus: 204 });
    const [url, request] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('https://region1.google-analytics.com/mp/collect?');
    expect(url).toContain('measurement_id=G-ABC12345');
    expect(request.method).toBe('POST');
    expect(JSON.parse(String(request.body)).events[0].name).toBe('generate_lead');
  });

  it('never logs the secret URL when fetch throws', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(
      new Error('https://region1.google-analytics.com/mp/collect?api_secret=leaked')
    );
    const logger = { error: vi.fn() };

    const result = await sendGoogleCrmEvent(base, env, {
      fetchImpl,
      logger,
      nowMs
    });

    expect(result).toEqual({ outcome: 'failed', acknowledge: false, retryable: true });
    expect(logger.error).toHaveBeenCalledWith('[google-ga4] delivery failed network_error');
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('measurement-protocol-secret');
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('api_secret');
  });

  it('dead-letters events that are older than the Measurement Protocol window', async () => {
    const result = await buildGoogleGa4Payload(
      { ...base, occurredAt: '2026-08-01T00:00:00.000Z' },
      env,
      { nowMs }
    );

    expect(result).toEqual({ outcome: 'skipped', reason: 'event_too_old' });
  });
});
