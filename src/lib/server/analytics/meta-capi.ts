import type { ExecutionContext } from '@cloudflare/workers-types';

export type MetaCapiEnv = {
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
  META_GRAPH_API_VERSION?: string;
  META_TEST_EVENT_CODE?: string;
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
): Promise<void> {
  const pixelId = env.META_PIXEL_ID?.trim();
  const token = env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token || !isConfigured(env)) return;

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
      `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    if (!response.ok) {
      console.error(`[meta-capi] ${eventName} delivery failed status=${response.status}`);
    }
  } catch (error) {
    console.error(
      `[meta-capi] ${eventName} delivery failed error=${error instanceof Error ? error.message : String(error)}`
    );
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

const schedule = async (
  task: Promise<void>,
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
  const eventSourceUrl = new URL(landingPage || '/', new URL(request.url).origin).toString();
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
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: await buildUserData(input),
        custom_data: customData
      },
      eventName
    ),
    context
  );
}
