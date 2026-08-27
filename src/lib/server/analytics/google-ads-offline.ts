export type GoogleAdsConversionStage = 'qualified' | 'booked' | 'completed';

export type GoogleAdsOfflineConversionInput = {
  stage: GoogleAdsConversionStage;
  outboxEventId: string;
  occurredAt: Date | string | number;
  adsMeasurementConsent: boolean;
  adUserDataConsent: boolean;
  adPersonalizationConsent?: boolean;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  email?: string;
  /** Must include a country code; this module never guesses one. */
  phone?: string;
  valueCents?: number;
  currency?: string;
};

export type GoogleDataManagerUserIdentifier =
  | { emailAddress: string }
  | { phoneNumber: string };

export type GoogleDataManagerOfflineEvent = {
  eventTimestamp: string;
  transactionId: string;
  eventSource: 'WEB';
  adIdentifiers?: {
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
  };
  userData?: {
    userIdentifiers: GoogleDataManagerUserIdentifier[];
  };
  consent: {
    adUserData: 'GRANTED' | 'DENIED';
    adPersonalization: 'GRANTED' | 'DENIED';
  };
  conversionValue?: number;
  currency?: string;
};

export type PreparedGoogleAdsOfflineConversion = {
  /** The future delivery adapter maps this key to a configured conversion action ID. */
  conversionActionKey: GoogleAdsConversionStage;
  encoding: 'HEX';
  event: GoogleDataManagerOfflineEvent;
};

export type GoogleAdsPreparationResult =
  | { outcome: 'ready'; conversion: PreparedGoogleAdsOfflineConversion }
  | { outcome: 'skipped'; reason: 'consent_denied' | 'invalid_event' }
  | { outcome: 'deferred'; reason: 'missing_identifiers' };

const encoder = new TextEncoder();

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const eventId = (value: string): string => {
  const normalized = value.trim();
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(normalized) ? normalized : '';
};

const clickId = (value: string | undefined): string => {
  const normalized = value?.trim() ?? '';
  if (!/^[A-Za-z0-9._~-]{10,500}$/.test(normalized)) return '';
  return normalized;
};

const normalizeEmail = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  const separator = normalized.lastIndexOf('@');
  if (separator <= 0 || separator === normalized.length - 1) return '';

  let local = normalized.slice(0, separator);
  const domain = normalized.slice(separator + 1);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return '';
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.split('+')[0].replace(/\./g, '');
  }
  if (!local) return '';
  return `${local}@${domain}`;
};

const normalizePhone = (value: string): string => {
  const normalized = value.trim().replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : '';
};

const currency = (value: string | undefined): string => {
  const normalized = value?.trim().toUpperCase() ?? '';
  return /^[A-Z]{3}$/.test(normalized) ? normalized : '';
};

const timestamp = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '';
};

/**
 * Prepares, but deliberately does not transmit, a Google Ads offline conversion.
 * The output matches the Data Manager API Event shape. A future adapter must add
 * OAuth, a Destination, and the conversion action ID for conversionActionKey.
 */
export async function prepareGoogleAdsOfflineConversion(
  input: GoogleAdsOfflineConversionInput
): Promise<GoogleAdsPreparationResult> {
  if (!input.adsMeasurementConsent) {
    return { outcome: 'skipped', reason: 'consent_denied' };
  }

  const transactionId = eventId(input.outboxEventId);
  const eventTimestamp = timestamp(input.occurredAt);
  if (!transactionId || !eventTimestamp) {
    return { outcome: 'skipped', reason: 'invalid_event' };
  }

  const valueCurrency = input.valueCents === undefined ? '' : currency(input.currency);
  if (
    input.valueCents !== undefined &&
    (!Number.isSafeInteger(input.valueCents) || input.valueCents < 0 || !valueCurrency)
  ) {
    return { outcome: 'skipped', reason: 'invalid_event' };
  }

  const adIdentifiers = {
    gclid: clickId(input.gclid) || undefined,
    gbraid: clickId(input.gbraid) || undefined,
    wbraid: clickId(input.wbraid) || undefined
  };
  const hasClickId = Object.values(adIdentifiers).some(Boolean);

  const userIdentifiers: GoogleDataManagerUserIdentifier[] = [];
  if (input.adUserDataConsent) {
    const email = normalizeEmail(input.email ?? '');
    const phone = normalizePhone(input.phone ?? '');
    if (email) userIdentifiers.push({ emailAddress: await sha256(email) });
    if (phone) userIdentifiers.push({ phoneNumber: await sha256(phone) });
  }

  if (!hasClickId && userIdentifiers.length === 0) {
    return { outcome: 'deferred', reason: 'missing_identifiers' };
  }

  const event: GoogleDataManagerOfflineEvent = {
    eventTimestamp,
    transactionId,
    eventSource: 'WEB',
    consent: {
      adUserData: input.adUserDataConsent ? 'GRANTED' : 'DENIED',
      adPersonalization: input.adPersonalizationConsent ? 'GRANTED' : 'DENIED'
    }
  };
  if (hasClickId) event.adIdentifiers = adIdentifiers;
  if (userIdentifiers.length > 0) event.userData = { userIdentifiers };
  if (input.valueCents !== undefined) {
    event.conversionValue = input.valueCents / 100;
    event.currency = valueCurrency;
  }

  return {
    outcome: 'ready',
    conversion: {
      conversionActionKey: input.stage,
      encoding: 'HEX',
      event
    }
  };
}
