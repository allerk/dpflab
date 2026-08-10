const encoder = new TextEncoder();

const GRAPH_LEAD_FIELDS = [
  'id',
  'created_time',
  'ad_id',
  'ad_name',
  'adset_id',
  'adset_name',
  'campaign_id',
  'campaign_name',
  'form_id',
  'field_data',
  'is_organic',
  'platform'
] as const;

const STANDARD_FIELD_NAMES = new Set([
  'full_name',
  'first_name',
  'last_name',
  'email',
  'work_email',
  'phone',
  'phone_number',
  'work_phone_number',
  'company_name',
  'job_title',
  'street_address',
  'city',
  'state',
  'province',
  'country',
  'post_code',
  'zip_code',
  'date_of_birth',
  'gender',
  'marital_status',
  'military_status',
  'relationship_status'
]);

const MAX_FIELDS = 100;
const MAX_VALUES_PER_FIELD = 20;
const MAX_FIELD_VALUE_LENGTH = 4_096;

export type MetaLeadWebhookEnv = {
  META_APP_SECRET?: string;
  META_LEADS_ACCESS_TOKEN?: string;
  META_LEADS_VERIFY_TOKEN?: string;
  META_LEADS_PAGE_ID?: string;
  META_LEADS_FORM_LOCALES?: string;
  META_GRAPH_API_VERSION?: string;
};

export type MetaLeadNotification = {
  leadId: string;
  pageId: string;
  formId: string;
  adId?: string;
  adsetId?: string;
  createdTime?: number;
};

export type MetaGraphLead = {
  id: string;
  created_time?: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  form_id?: string;
  field_data?: Array<{ name?: unknown; values?: unknown }>;
  is_organic?: boolean;
  platform?: string;
};

export type NormalizedMetaLead = {
  provider: 'meta';
  source: 'meta_instant_form';
  idempotencyKey: string;
  externalLeadId: string;
  pageId: string;
  formId: string;
  createdAt: string;
  receivedAt: string;
  locale?: string;
  adId?: string;
  adName?: string;
  adsetId?: string;
  adsetName?: string;
  campaignId?: string;
  campaignName?: string;
  platform?: string;
  isOrganic?: boolean;
  fullName?: string;
  email?: string;
  phone?: string;
  serviceType?: string;
  filterState?: string;
  clientType?: string;
  vehicle?: string;
  urgency?: string;
  standardFields: Record<string, string[]>;
  customFields: Record<string, string[]>;
};

export type MetaLeadSinkResult = {
  submissionId: number;
  inserted: boolean;
};

export type MetaLeadSink = (lead: NormalizedMetaLead) => Promise<MetaLeadSinkResult>;

export class MetaLeadIntegrationError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, options: { retryable?: boolean; cause?: unknown } = {}) {
    super(code, { cause: options.cause });
    this.name = 'MetaLeadIntegrationError';
    this.code = code;
    this.retryable = options.retryable ?? false;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMetaId = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{5,40}$/.test(value);

const hexToBytes = (value: string): Uint8Array => {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const bytesToHex = (value: ArrayBuffer): string =>
  [...new Uint8Array(value)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const importHmacKey = (secret: string, usages: KeyUsage[]) =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages
  );

/** Verifies Meta's sha256 HMAC over the exact, unparsed request bytes. */
export async function verifyMetaWebhookSignature(
  body: ArrayBuffer,
  signatureHeader: string | null,
  appSecret: string
): Promise<boolean> {
  const match = /^sha256=([0-9a-f]{64})$/i.exec(signatureHeader ?? '');
  if (!match || !appSecret) return false;

  try {
    const key = await importHmacKey(appSecret, ['verify']);
    return await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBytes(match[1]).buffer as ArrayBuffer,
      body
    );
  } catch {
    return false;
  }
}

/** Constant-time comparison for the verification token used by Meta's GET challenge. */
export async function secureTokenEquals(actual: string | null, expected: string): Promise<boolean> {
  if (!actual || !expected) return false;
  const key = await importHmacKey(expected, ['verify']);
  const message = encoder.encode('meta-webhook-verification');
  const actualKey = await importHmacKey(actual, ['sign']);
  const actualMac = await crypto.subtle.sign('HMAC', actualKey, message);
  return crypto.subtle.verify('HMAC', key, actualMac, message);
}

function readNotification(
  entryId: unknown,
  value: unknown,
  configuredPageId: string
): MetaLeadNotification {
  if (!isRecord(value)) throw new MetaLeadIntegrationError('invalid_leadgen_change');

  const pageId = isMetaId(value.page_id) ? value.page_id : entryId;
  const leadId = value.leadgen_id;
  const formId = value.form_id;
  if (!isMetaId(pageId) || !isMetaId(leadId) || !isMetaId(formId)) {
    throw new MetaLeadIntegrationError('invalid_leadgen_change');
  }
  if (pageId !== configuredPageId || (isMetaId(entryId) && entryId !== pageId)) {
    throw new MetaLeadIntegrationError('unexpected_page');
  }

  return {
    leadId,
    pageId,
    formId,
    ...(isMetaId(value.ad_id) ? { adId: value.ad_id } : {}),
    ...(isMetaId(value.adgroup_id) ? { adsetId: value.adgroup_id } : {}),
    ...(typeof value.created_time === 'number' && Number.isFinite(value.created_time)
      ? { createdTime: Math.floor(value.created_time) }
      : {})
  };
}

/** Extracts and deduplicates Page leadgen notifications from a signed webhook envelope. */
export function extractMetaLeadNotifications(
  payload: unknown,
  configuredPageId: string
): MetaLeadNotification[] {
  if (!isRecord(payload)) throw new MetaLeadIntegrationError('invalid_webhook_payload');
  if (payload.object !== 'page') return [];
  if (!Array.isArray(payload.entry)) throw new MetaLeadIntegrationError('invalid_webhook_payload');

  const notifications = new Map<string, MetaLeadNotification>();
  for (const entry of payload.entry) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) {
      throw new MetaLeadIntegrationError('invalid_webhook_payload');
    }
    for (const change of entry.changes) {
      if (!isRecord(change) || change.field !== 'leadgen') continue;
      const notification = readNotification(entry.id, change.value, configuredPageId);
      notifications.set(notification.leadId, notification);
    }
  }
  return [...notifications.values()];
}

const normalizeFieldName = (value: unknown, index: number): string => {
  if (typeof value !== 'string') return `field_${index}`;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
    .slice(0, 128);
  if (!normalized || ['__proto__', 'constructor', 'prototype'].includes(normalized)) {
    return `field_${index}`;
  }
  return normalized;
};

const normalizeValues = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : [value];
  return values
    .slice(0, MAX_VALUES_PER_FIELD)
    .flatMap((item) => {
      if (!['string', 'number', 'boolean'].includes(typeof item)) return [];
      const normalized = String(item).trim().slice(0, MAX_FIELD_VALUE_LENGTH);
      return normalized ? [normalized] : [];
    });
};

function normalizeFieldData(fieldData: MetaGraphLead['field_data']): {
  standardFields: Record<string, string[]>;
  customFields: Record<string, string[]>;
} {
  const allFields = new Map<string, string[]>();
  for (const [index, field] of (fieldData ?? []).slice(0, MAX_FIELDS).entries()) {
    if (!isRecord(field)) continue;
    const name = normalizeFieldName(field.name, index);
    const values = normalizeValues(field.values);
    if (!values.length) continue;
    allFields.set(name, [...(allFields.get(name) ?? []), ...values].slice(0, MAX_VALUES_PER_FIELD));
  }

  const standardFields: Record<string, string[]> = {};
  const customFields: Record<string, string[]> = {};
  for (const [name, values] of allFields) {
    (STANDARD_FIELD_NAMES.has(name) ? standardFields : customFields)[name] = values;
  }
  return { standardFields, customFields };
}

const firstValue = (fields: Record<string, string[]>, ...names: string[]) => {
  for (const name of names) {
    const value = fields[name]?.[0];
    if (value) return value;
  }
  return undefined;
};

const validIsoDate = (value: unknown, fallbackSeconds: number | undefined, receivedAt: Date) => {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString();
  }
  if (fallbackSeconds && fallbackSeconds > 0) {
    const parsed = new Date(fallbackSeconds * 1_000);
    if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString();
  }
  return receivedAt.toISOString();
};

export function parseMetaFormLocales(value: string | undefined): Record<string, string> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).flatMap(([formId, locale]) =>
        isMetaId(formId) && typeof locale === 'string' && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)
          ? [[formId, locale]]
          : []
      )
    );
  } catch {
    return {};
  }
}

export function normalizeMetaLead(
  graphLead: MetaGraphLead,
  notification: MetaLeadNotification,
  options: { receivedAt?: Date; formLocales?: Record<string, string> } = {}
): NormalizedMetaLead {
  if (!isMetaId(graphLead.id) || graphLead.id !== notification.leadId) {
    throw new MetaLeadIntegrationError('lead_id_mismatch');
  }
  const formId = isMetaId(graphLead.form_id) ? graphLead.form_id : notification.formId;
  if (formId !== notification.formId) throw new MetaLeadIntegrationError('form_id_mismatch');

  const receivedAt = options.receivedAt ?? new Date();
  const { standardFields, customFields } = normalizeFieldData(graphLead.field_data);
  const firstName = firstValue(standardFields, 'first_name');
  const lastName = firstValue(standardFields, 'last_name');
  const composedName = [firstName, lastName].filter(Boolean).join(' ') || undefined;

  return {
    provider: 'meta',
    source: 'meta_instant_form',
    idempotencyKey: `meta:lead:${graphLead.id}`,
    externalLeadId: graphLead.id,
    pageId: notification.pageId,
    formId,
    createdAt: validIsoDate(graphLead.created_time, notification.createdTime, receivedAt),
    receivedAt: receivedAt.toISOString(),
    ...(options.formLocales?.[formId] ? { locale: options.formLocales[formId] } : {}),
    ...(isMetaId(graphLead.ad_id ?? notification.adId)
      ? { adId: (graphLead.ad_id ?? notification.adId) as string }
      : {}),
    ...(graphLead.ad_name ? { adName: graphLead.ad_name.slice(0, 500) } : {}),
    ...(isMetaId(graphLead.adset_id ?? notification.adsetId)
      ? { adsetId: (graphLead.adset_id ?? notification.adsetId) as string }
      : {}),
    ...(graphLead.adset_name ? { adsetName: graphLead.adset_name.slice(0, 500) } : {}),
    ...(isMetaId(graphLead.campaign_id) ? { campaignId: graphLead.campaign_id } : {}),
    ...(graphLead.campaign_name ? { campaignName: graphLead.campaign_name.slice(0, 500) } : {}),
    ...(graphLead.platform ? { platform: graphLead.platform.slice(0, 50) } : {}),
    ...(typeof graphLead.is_organic === 'boolean' ? { isOrganic: graphLead.is_organic } : {}),
    ...(firstValue(standardFields, 'full_name') ?? composedName
      ? { fullName: firstValue(standardFields, 'full_name') ?? composedName }
      : {}),
    ...(firstValue(standardFields, 'email', 'work_email')
      ? { email: firstValue(standardFields, 'email', 'work_email') }
      : {}),
    ...(firstValue(standardFields, 'phone_number', 'phone', 'work_phone_number')
      ? { phone: firstValue(standardFields, 'phone_number', 'phone', 'work_phone_number') }
      : {}),
    ...(firstValue(customFields, 'service_type')
      ? { serviceType: firstValue(customFields, 'service_type') }
      : {}),
    ...(firstValue(customFields, 'filter_state')
      ? { filterState: firstValue(customFields, 'filter_state') }
      : {}),
    ...(firstValue(customFields, 'client_type')
      ? { clientType: firstValue(customFields, 'client_type') }
      : {}),
    ...(firstValue(customFields, 'vehicle') ? { vehicle: firstValue(customFields, 'vehicle') } : {}),
    ...(firstValue(customFields, 'urgency') ? { urgency: firstValue(customFields, 'urgency') } : {}),
    standardFields,
    customFields
  };
}

async function appSecretProof(accessToken: string, appSecret: string): Promise<string> {
  const key = await importHmacKey(appSecret, ['sign']);
  return bytesToHex(await crypto.subtle.sign('HMAC', key, encoder.encode(accessToken)));
}

const graphVersion = (value: string | undefined): string => {
  if (!value) return 'v25.0';
  if (!/^v\d{1,2}\.\d+$/.test(value)) throw new MetaLeadIntegrationError('invalid_graph_version');
  return value;
};

/** Fetches the complete lead with a bearer token; credentials never enter the URL or logs. */
export async function fetchMetaLead(
  notification: MetaLeadNotification,
  env: MetaLeadWebhookEnv,
  fetcher: typeof fetch = fetch
): Promise<MetaGraphLead> {
  const accessToken = env.META_LEADS_ACCESS_TOKEN?.trim();
  const appSecret = env.META_APP_SECRET?.trim();
  if (!accessToken || !appSecret) throw new MetaLeadIntegrationError('integration_not_configured');

  const url = new URL(
    `https://graph.facebook.com/${graphVersion(env.META_GRAPH_API_VERSION)}/${encodeURIComponent(notification.leadId)}`
  );
  url.searchParams.set('fields', GRAPH_LEAD_FIELDS.join(','));
  url.searchParams.set('appsecret_proof', await appSecretProof(accessToken, appSecret));

  let response: Response;
  try {
    response = await fetcher(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: 'application/json'
      }
    });
  } catch (cause) {
    throw new MetaLeadIntegrationError('graph_unavailable', { retryable: true, cause });
  }

  if (!response.ok) {
    throw new MetaLeadIntegrationError('graph_request_failed', {
      retryable: response.status === 429 || response.status >= 500
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new MetaLeadIntegrationError('invalid_graph_response', { retryable: true, cause });
  }
  if (!isRecord(body) || !isMetaId(body.id)) {
    throw new MetaLeadIntegrationError('invalid_graph_response', { retryable: true });
  }
  return body as MetaGraphLead;
}

export async function retrieveAndIngestMetaLeads(
  notifications: MetaLeadNotification[],
  env: MetaLeadWebhookEnv,
  sink: MetaLeadSink,
  options: { fetcher?: typeof fetch; receivedAt?: Date } = {}
): Promise<MetaLeadSinkResult[]> {
  const formLocales = parseMetaFormLocales(env.META_LEADS_FORM_LOCALES);
  const results: MetaLeadSinkResult[] = [];
  for (const notification of notifications) {
    const graphLead = await fetchMetaLead(notification, env, options.fetcher);
    const normalized = normalizeMetaLead(graphLead, notification, {
      receivedAt: options.receivedAt,
      formLocales
    });
    results.push(await sink(normalized));
  }
  return results;
}
