export type GoogleCrmStage = 'lead_created' | 'qualified' | 'booked' | 'completed';

export type GoogleGa4Env = {
  GOOGLE_ANALYTICS_MEASUREMENT_ID?: string;
  GOOGLE_ANALYTICS_API_SECRET?: string;
  GOOGLE_ANALYTICS_PSEUDONYM_KEY?: string;
  GOOGLE_ANALYTICS_REGION?: string;
  /** Explicit production launch gate after privacy disclosure and consent QA. */
  GOOGLE_CRM_EVENTS_ENABLED?: string;
};

export type GoogleCrmEventInput = {
  stage: GoogleCrmStage;
  outboxEventId: string;
  occurredAt: Date | string | number;
  /**
   * Opaque, stable CRM identifier. It must not contain an email address, phone
   * number, name, or other PII. It is HMAC-pseudonymized before leaving the app.
   */
  leadKey: string;
  analyticsConsent: boolean;
  adUserDataConsent?: boolean;
  adPersonalizationConsent?: boolean;
  /** Prefer the value returned by gtag/GTM. A raw GA client cookie is also accepted. */
  clientId?: string;
  /** Prefer the value returned by gtag/GTM. A raw GA session cookie is also accepted. */
  sessionId?: string | number;
  engagementTimeMsec?: number;
  leadSource?: string;
  serviceType?: string;
  locale?: string;
  valueCents?: number;
  currency?: string;
};

export type GoogleGa4Payload = {
  client_id: string;
  timestamp_micros: number;
  consent: {
    ad_user_data: 'GRANTED' | 'DENIED';
    ad_personalization: 'GRANTED' | 'DENIED';
  };
  events: Array<{
    name: string;
    params: Record<string, unknown>;
  }>;
};

export type GoogleGa4BuildResult =
  | { outcome: 'ready'; payload: GoogleGa4Payload }
  | {
      outcome: 'skipped';
      reason: 'consent_denied' | 'event_too_old' | 'invalid_event';
    }
  | {
      outcome: 'deferred';
      reason: 'missing_client_id' | 'missing_pseudonym_key';
    };

export type GoogleGa4DeliveryResult =
  | { outcome: 'delivered'; acknowledge: true; httpStatus: number }
  | {
      outcome: 'skipped';
      acknowledge: true;
      reason: 'consent_denied' | 'event_too_old' | 'invalid_event';
    }
  | {
      outcome: 'deferred';
      acknowledge: false;
      reason: 'not_configured' | 'policy_not_enabled' | 'missing_client_id' | 'missing_pseudonym_key';
    }
  | {
      outcome: 'failed';
      acknowledge: false;
      retryable: boolean;
      httpStatus?: number;
    };

type BuildOptions = {
  nowMs?: number;
};

type SendOptions = BuildOptions & {
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, 'error'>;
};

const MAX_EVENT_AGE_MS = 72 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
const encoder = new TextEncoder();

const configured = (env: GoogleGa4Env): boolean =>
  /^G-[A-Z0-9]{4,20}$/i.test(env.GOOGLE_ANALYTICS_MEASUREMENT_ID?.trim() ?? '') &&
  Boolean(env.GOOGLE_ANALYTICS_API_SECRET?.trim());

const safeIdentifier = (value: string | number | undefined, max = 256): string => {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized.length > max || /\s/.test(normalized)) return '';
  return normalized;
};

const safeClientId = (value: string | undefined): string => {
  const normalized = safeIdentifier(value);
  return /^[A-Za-z0-9._-]{3,256}$/.test(normalized) ? normalized : '';
};

const safeLeadKey = (value: string): string => {
  const normalized = value.trim();
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(normalized) ? normalized : '';
};

const safeEventId = (value: string): string => {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(normalized)) return '';
  return normalized;
};

const safeText = (value: string | undefined): string =>
  (value ?? '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 100);

const validCurrency = (value: string | undefined): string => {
  const normalized = value?.trim().toUpperCase() ?? '';
  return /^[A-Z]{3}$/.test(normalized) ? normalized : '';
};

const parseOccurredAt = (value: Date | string | number): number => {
  const milliseconds = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(milliseconds) ? milliseconds : Number.NaN;
};

const hex = (bytes: ArrayBuffer): string =>
  [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

async function pseudonymizeLead(leadKey: string, keyMaterial: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyMaterial),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(leadKey));
  return `crm.${hex(signature)}`;
}

const valueParameters = (
  valueCents: number | undefined,
  currency: string | undefined
): { value?: number; currency?: string } | null => {
  if (valueCents === undefined) return {};
  const normalizedCurrency = validCurrency(currency);
  if (!Number.isSafeInteger(valueCents) || valueCents < 0 || !normalizedCurrency) return null;
  return {
    value: valueCents / 100,
    currency: normalizedCurrency
  };
};

function buildEvents(input: GoogleCrmEventInput): GoogleGa4Payload['events'] | null {
  const eventId = safeEventId(input.outboxEventId);
  if (!eventId) return null;

  const monetary = valueParameters(input.valueCents, input.currency);
  if (!monetary) return null;

  const params: Record<string, unknown> = {
    event_id: eventId,
    crm_stage: input.stage
  };
  const sessionId = safeIdentifier(input.sessionId);
  if (sessionId) params.session_id = sessionId;
  if (
    Number.isSafeInteger(input.engagementTimeMsec) &&
    (input.engagementTimeMsec ?? 0) > 0
  ) {
    params.engagement_time_msec = input.engagementTimeMsec;
  }

  const source = safeText(input.leadSource);
  const serviceType = safeText(input.serviceType);
  const locale = safeText(input.locale);
  if (source) params.lead_source = source;
  if (serviceType) params.service_type = serviceType;
  if (locale) params.lead_locale = locale;
  Object.assign(params, monetary);

  const item = serviceType ? [{ item_id: serviceType }] : undefined;
  const withItem = (extra: Record<string, unknown> = {}) => ({
    ...params,
    ...extra,
    ...(item ? { items: item } : {})
  });

  if (input.stage === 'lead_created') {
    return [{ name: 'generate_lead', params: withItem() }];
  }
  if (input.stage === 'qualified') {
    return [{ name: 'qualify_lead', params: withItem() }];
  }
  if (input.stage === 'booked') {
    return [{ name: 'working_lead', params: withItem({ lead_status: 'booked' }) }];
  }

  const completed: GoogleGa4Payload['events'] = [
    { name: 'close_convert_lead', params: withItem() }
  ];
  if (input.valueCents !== undefined && input.valueCents > 0 && serviceType) {
    completed.push({
      name: 'purchase',
      params: {
        ...params,
        event_id: `${eventId.slice(0, 91)}:purchase`,
        transaction_id: eventId,
        items: [{ item_id: serviceType, price: input.valueCents / 100, quantity: 1 }]
      }
    });
  }
  return completed;
}

/**
 * Produces a GA4 Measurement Protocol payload without accepting contact PII.
 * The caller can persist the outbox event before calling sendGoogleCrmEvent.
 */
export async function buildGoogleGa4Payload(
  input: GoogleCrmEventInput,
  env: GoogleGa4Env,
  options: BuildOptions = {}
): Promise<GoogleGa4BuildResult> {
  if (!input.analyticsConsent) {
    return { outcome: 'skipped', reason: 'consent_denied' };
  }

  const nowMs = options.nowMs ?? Date.now();
  const occurredAtMs = parseOccurredAt(input.occurredAt);
  if (!Number.isFinite(occurredAtMs) || occurredAtMs > nowMs + MAX_FUTURE_SKEW_MS) {
    return { outcome: 'skipped', reason: 'invalid_event' };
  }
  if (occurredAtMs < nowMs - MAX_EVENT_AGE_MS) {
    return { outcome: 'skipped', reason: 'event_too_old' };
  }

  const events = buildEvents(input);
  if (!events) return { outcome: 'skipped', reason: 'invalid_event' };

  let clientId = safeClientId(input.clientId);
  if (!clientId) {
    const leadKey = safeLeadKey(input.leadKey);
    if (!leadKey) return { outcome: 'deferred', reason: 'missing_client_id' };

    const pseudonymKey = env.GOOGLE_ANALYTICS_PSEUDONYM_KEY?.trim() ?? '';
    if (pseudonymKey.length < 32) {
      return { outcome: 'deferred', reason: 'missing_pseudonym_key' };
    }
    clientId = await pseudonymizeLead(leadKey, pseudonymKey);
  }

  return {
    outcome: 'ready',
    payload: {
      client_id: clientId,
      timestamp_micros: Math.trunc(occurredAtMs * 1000),
      consent: {
        ad_user_data: input.adUserDataConsent ? 'GRANTED' : 'DENIED',
        ad_personalization: input.adPersonalizationConsent ? 'GRANTED' : 'DENIED'
      },
      events
    }
  };
}

export async function sendGoogleCrmEvent(
  input: GoogleCrmEventInput,
  env: GoogleGa4Env,
  options: SendOptions = {}
): Promise<GoogleGa4DeliveryResult> {
  if (!configured(env)) {
    return { outcome: 'deferred', acknowledge: false, reason: 'not_configured' };
  }
  if (env.GOOGLE_CRM_EVENTS_ENABLED !== 'true') {
    return { outcome: 'deferred', acknowledge: false, reason: 'policy_not_enabled' };
  }

  const built = await buildGoogleGa4Payload(input, env, options);
  if (built.outcome !== 'ready') {
    return {
      ...built,
      acknowledge: built.outcome === 'skipped'
    } as GoogleGa4DeliveryResult;
  }

  const host = env.GOOGLE_ANALYTICS_REGION?.trim().toLowerCase() === 'global'
    ? 'www.google-analytics.com'
    : 'region1.google-analytics.com';
  const query = new URLSearchParams({
    measurement_id: env.GOOGLE_ANALYTICS_MEASUREMENT_ID!.trim(),
    api_secret: env.GOOGLE_ANALYTICS_API_SECRET!.trim()
  });
  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(`https://${host}/mp/collect?${query}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(built.payload)
    });

    if (response.ok) {
      return { outcome: 'delivered', acknowledge: true, httpStatus: response.status };
    }

    options.logger?.error(`[google-ga4] delivery failed status=${response.status}`);
    return {
      outcome: 'failed',
      acknowledge: false,
      retryable: response.status === 429 || response.status >= 500,
      httpStatus: response.status
    };
  } catch {
    // Do not log the exception: some fetch implementations include the secret URL.
    options.logger?.error('[google-ga4] delivery failed network_error');
    return { outcome: 'failed', acknowledge: false, retryable: true };
  }
}
