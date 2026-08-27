import type { ExecutionContext } from '@cloudflare/workers-types';

export type MetaCapiEnv = {
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
  META_GRAPH_API_VERSION?: string;
  META_TEST_EVENT_CODE?: string;
  /** Explicit launch gate for Instant Form CRM lifecycle feedback in the EU. */
  META_CRM_EVENTS_ENABLED?: string;
  /** Separate gate for post-submit site CRM stages; keep off without revocation sync. */
  META_SITE_CRM_EVENTS_ENABLED?: string;
};

export type MetaCrmDeliveryResult =
  | { outcome: 'delivered'; acknowledge: true; httpStatus: number }
  | { outcome: 'skipped'; acknowledge: true; reason: 'consent_denied' | 'unsupported_origin' }
  | { outcome: 'deferred'; acknowledge: false; reason: 'not_configured' | 'policy_not_enabled' }
  | { outcome: 'failed'; acknowledge: false; retryable: boolean; httpStatus?: number };

export type MetaCrmEventInput = {
  stage: 'qualified' | 'booked' | 'completed';
  eventId: string;
  occurredAt: Date | string | number;
  origin: 'site' | 'meta_instant' | 'whatsapp' | 'manual';
  externalLeadId?: string;
  landingPage?: string;
  name: string;
  phone: string;
  email: string;
  locale: string;
  serviceType: string;
  fbp?: string;
  fbc?: string;
  analyticsConsent: boolean;
  orderAmountCents: number;
};

type MetaLeadEventInput = {
  eventId: string;
  request: Request;
  name: string;
  phone: string;
  email: string;
  locale: string;
  serviceType: string;
  fbp: string;
  fbc: string;
  analyticsConsent: boolean;
};

type ScheduleMetaLeadEventInput = MetaLeadEventInput & {
  env?: MetaCapiEnv;
  context?: ExecutionContext;
};

type MetaPipelineStage = 'qualified' | 'booked' | 'completed';

type ScheduleMetaPipelineEventInput = {
  stage: MetaPipelineStage;
  submissionId: number;
  request: Request;
  landingPage: string;
  name: string;
  phone: string;
  email: string;
  locale: string;
  serviceType: string;
  fbp: string;
  fbc: string;
  analyticsConsent: boolean;
  orderAmountCents: number;
  env?: MetaCapiEnv;
  context?: ExecutionContext;
};

const encoder = new TextEncoder();

const hash = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const normalizedPhone = (value: string) => value.replace(/\D/g, '');
const normalizedEmail = (value: string) => value.trim().toLowerCase();
const normalizedName = (value: string) => value.trim().toLowerCase().split(/\s+/)[0] ?? '';

const isConfigured = (env: MetaCapiEnv) =>
  /^\d{5,20}$/.test(env.META_PIXEL_ID?.trim() ?? '') &&
  Boolean(env.META_CAPI_TOKEN?.trim());

async function buildUserData(
  input: Pick<MetaLeadEventInput, 'name' | 'phone' | 'email' | 'fbp' | 'fbc'>,
  request?: Request
): Promise<Record<string, string | string[]>> {
  const userData: Record<string, string | string[]> = {};
  const phone = normalizedPhone(input.phone);
  const email = normalizedEmail(input.email);
  const firstName = normalizedName(input.name);
  if (phone) userData.ph = [await hash(phone)];
  if (email) userData.em = [await hash(email)];
  if (firstName) userData.fn = [await hash(firstName)];
  if (/^fb\.1\./.test(input.fbp)) userData.fbp = input.fbp.slice(0, 300);
  if (/^fb\.1\./.test(input.fbc)) userData.fbc = input.fbc.slice(0, 300);

  if (request) {
    const clientIp =
      request.headers.get('CF-Connecting-IP') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      '';
    const userAgent = request.headers.get('user-agent') ?? '';
    if (clientIp) userData.client_ip_address = clientIp;
    if (userAgent) userData.client_user_agent = userAgent;
  }

  return userData;
}

async function deliverMetaEvent(
  env: MetaCapiEnv,
  event: Record<string, unknown>,
  eventName: string
): Promise<MetaCrmDeliveryResult> {
  const pixelId = env.META_PIXEL_ID?.trim();
  const token = env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token || !isConfigured(env)) {
    return { outcome: 'deferred', acknowledge: false, reason: 'not_configured' };
  }

  const version = /^v\d+\.\d+$/.test(env.META_GRAPH_API_VERSION ?? '')
    ? env.META_GRAPH_API_VERSION
    : 'v25.0';
  const payload: Record<string, unknown> = {
    data: [event]
  };
  if (env.META_TEST_EVENT_CODE?.trim()) {
    payload.test_event_code = env.META_TEST_EVENT_CODE.trim();
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );
    if (!response.ok) {
      let graphTransient = false;
      try {
        const reader = response.body?.getReader();
        if (reader) {
          const chunks: Uint8Array[] = [];
          let length = 0;
          while (length <= 32_768) {
            const item = await reader.read();
            if (item.done) break;
            length += item.value.byteLength;
            if (length > 32_768) {
              await reader.cancel();
              break;
            }
            chunks.push(item.value);
          }
          if (length <= 32_768) {
            const bytes = new Uint8Array(length);
            let offset = 0;
            for (const chunk of chunks) {
              bytes.set(chunk, offset);
              offset += chunk.byteLength;
            }
            const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
              error?: { is_transient?: boolean };
            };
            graphTransient = parsed.error?.is_transient === true;
          }
        }
      } catch {
        graphTransient = false;
      }
      console.error(`[meta-capi] ${eventName} delivery failed status=${response.status}`);
      return {
        outcome: 'failed',
        acknowledge: false,
        retryable: graphTransient || response.status === 429 || response.status >= 500,
        httpStatus: response.status
      };
    }
    return { outcome: 'delivered', acknowledge: true, httpStatus: response.status };
  } catch {
    // Avoid exception messages: fetch implementations may include the credential-bearing request.
    console.error(`[meta-capi] ${eventName} delivery failed network_error`);
    return { outcome: 'failed', acknowledge: false, retryable: true };
  }
}

async function sendMetaLeadEvent(
  input: MetaLeadEventInput,
  env: MetaCapiEnv
): Promise<void> {
  if (!input.analyticsConsent || !isConfigured(env)) return;
  await deliverMetaEvent(
    env,
    {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      event_source_url: input.request.url,
      action_source: 'website',
      user_data: await buildUserData(input, input.request),
      custom_data: {
        content_name: input.serviceType || 'service_request',
        locale: input.locale
      }
    },
    'Lead'
  );
}

const occurredAtSeconds = (value: Date | string | number): number => {
  const milliseconds = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(milliseconds) ? Math.floor(milliseconds / 1_000) : Math.floor(Date.now() / 1_000);
};

/** Sends a durable CRM stage event after the outbox row has been claimed. */
export async function sendMetaCrmEvent(
  input: MetaCrmEventInput,
  env: MetaCapiEnv
): Promise<MetaCrmDeliveryResult> {
  if (!isConfigured(env)) {
    return { outcome: 'deferred', acknowledge: false, reason: 'not_configured' };
  }

  const eventNames: Record<MetaCrmEventInput['stage'], string> = {
    qualified: 'QualifiedLead',
    booked: 'Schedule',
    completed: 'Purchase'
  };
  const customData: Record<string, string | number> = {
    content_name: input.serviceType || 'service_request',
    locale: input.locale
  };
  if (input.stage === 'completed') {
    customData.currency = 'EUR';
    customData.value = Math.max(0, input.orderAmountCents) / 100;
  }

  if (input.origin === 'meta_instant') {
    if (env.META_CRM_EVENTS_ENABLED !== 'true') {
      return { outcome: 'deferred', acknowledge: false, reason: 'policy_not_enabled' };
    }
    if (!/^\d{5,40}$/.test(input.externalLeadId ?? '')) {
      return { outcome: 'failed', acknowledge: false, retryable: false };
    }
    customData.event_source = 'crm';
    return deliverMetaEvent(
      env,
      {
        event_name: eventNames[input.stage],
        event_time: occurredAtSeconds(input.occurredAt),
        event_id: input.eventId,
        action_source: 'system_generated',
        user_data: { lead_id: input.externalLeadId },
        custom_data: customData
      },
      eventNames[input.stage]
    );
  }

  if (input.origin !== 'site') {
    return { outcome: 'skipped', acknowledge: true, reason: 'unsupported_origin' };
  }
  if (env.META_SITE_CRM_EVENTS_ENABLED !== 'true') {
    return { outcome: 'deferred', acknowledge: false, reason: 'policy_not_enabled' };
  }
  if (!input.analyticsConsent) {
    return { outcome: 'skipped', acknowledge: true, reason: 'consent_denied' };
  }
  return deliverMetaEvent(
    env,
    {
      event_name: eventNames[input.stage],
      event_time: occurredAtSeconds(input.occurredAt),
      event_id: input.eventId,
      action_source: 'system_generated',
      user_data: await buildUserData({
        name: input.name,
        phone: input.phone,
        email: input.email,
        fbp: input.fbp ?? '',
        fbc: input.fbc ?? ''
      }),
      custom_data: customData
    },
    eventNames[input.stage]
  );
}

const schedule = async (
  task: Promise<unknown>,
  context: ExecutionContext | undefined
): Promise<void> => {
  if (context?.waitUntil) {
    context.waitUntil(task);
    return;
  }
  await task;
};

export async function scheduleMetaLeadEvent({
  env,
  context,
  ...input
}: ScheduleMetaLeadEventInput): Promise<void> {
  if (!env) return;
  await schedule(sendMetaLeadEvent(input, env), context);
}

export async function scheduleMetaPipelineEvent({
  env,
  context,
  stage,
  submissionId,
  request,
  landingPage,
  orderAmountCents,
  ...input
}: ScheduleMetaPipelineEventInput): Promise<void> {
  if (!env || !input.analyticsConsent || !isConfigured(env)) return;

  const eventNames: Record<MetaPipelineStage, string> = {
    qualified: 'QualifiedLead',
    booked: 'Schedule',
    completed: 'Purchase'
  };
  const eventName = eventNames[stage];
  const customData: Record<string, string | number> = {
    content_name: input.serviceType || 'service_request',
    locale: input.locale
  };
  if (stage === 'completed') {
    customData.currency = 'EUR';
    customData.value = Math.max(0, orderAmountCents) / 100;
  }

  await schedule(
    deliverMetaEvent(
      env,
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: `site-lead-${submissionId}-${stage}`,
        action_source: 'system_generated',
        user_data: await buildUserData(input),
        custom_data: customData
      },
      eventName
    ),
    context
  );
}
