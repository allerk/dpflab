import { browser } from '$app/environment';

export type ConsentChoice = 'accepted' | 'necessary';

const CONSENT_KEY = 'dpflab_consent_v1';
const CONSENT_EVENT = 'dpflab:consent';
const OPEN_CONSENT_EVENT = 'dpflab:open-consent';

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
};

type AnalyticsWindow = Window & {
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

export function getConsentChoice(): ConsentChoice | null {
  if (!browser) return null;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  if (stored === 'accepted' || stored === 'necessary') return stored;
  try {
    const parsed = JSON.parse(stored ?? '{}') as { choice?: string };
    return parsed.choice === 'accepted' || parsed.choice === 'necessary' ? parsed.choice : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsentChoice() === 'accepted';
}

export function setConsentChoice(choice: ConsentChoice): void {
  if (!browser) return;
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, version: 2, updatedAt: new Date().toISOString() }));
  const analyticsWindow = window as AnalyticsWindow;
  if (choice === 'necessary') {
    analyticsWindow.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    analyticsWindow.fbq?.('consent', 'revoke');
    for (const rawCookie of document.cookie.split(';')) {
      const name = rawCookie.split('=')[0]?.trim();
      if (!name || (!name.startsWith('_ga') && name !== '_fbp' && name !== '_fbc')) continue;
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.dpflab.ee; SameSite=Lax`;
    }
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

export function openConsentSettings(): void {
  if (!browser) return;
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
}

export function consentEventName(): string {
  return CONSENT_EVENT;
}

export function openConsentEventName(): string {
  return OPEN_CONSENT_EVENT;
}

export function initMetaPixel(pixelId?: string): void {
  if (!browser || !pixelId || !/^\d{5,20}$/.test(pixelId) || !hasAnalyticsConsent()) return;

  const analyticsWindow = window as AnalyticsWindow;
  if (analyticsWindow.fbq) {
    analyticsWindow.fbq('consent', 'grant');
    return;
  }

  const fbq: MetaPixelFunction = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';

  analyticsWindow.fbq = fbq;
  analyticsWindow._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('init', pixelId);
  fbq('consent', 'grant');
  fbq('track', 'PageView');
}

export function initGoogleAnalytics(measurementId?: string): void {
  if (
    !browser ||
    !/^G-[A-Z0-9]{4,20}$/i.test(measurementId ?? '') ||
    !hasAnalyticsConsent()
  ) return;

  const analyticsWindow = window as AnalyticsWindow;
  if (analyticsWindow.gtag) {
    analyticsWindow.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    return;
  }
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer!.push(args);
  analyticsWindow.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  analyticsWindow.gtag('js', new Date());
  analyticsWindow.gtag('config', measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    ads_data_redaction: true
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId ?? '')}`;
  document.head.appendChild(script);
}

export function trackMetaEvent(
  eventName: string,
  parameters: Record<string, string | number | boolean> = {},
  eventId?: string
): void {
  if (!browser || !hasAnalyticsConsent()) return;
  const fbq = (window as AnalyticsWindow).fbq;
  if (!fbq) return;

  if (eventId) fbq('trackCustom', eventName, parameters, { eventID: eventId });
  else fbq('trackCustom', eventName, parameters);
}

export function trackMetaStandardEvent(
  eventName: string,
  parameters: Record<string, string | number | boolean> = {},
  eventId?: string
): void {
  if (!browser || !hasAnalyticsConsent()) return;
  const fbq = (window as AnalyticsWindow).fbq;
  if (!fbq) return;

  if (eventId) fbq('track', eventName, parameters, { eventID: eventId });
  else fbq('track', eventName, parameters);
}

export function getMetaBrowserIdentifiers(): { fbp: string; fbc: string } {
  if (!browser || !hasAnalyticsConsent()) return { fbp: '', fbc: '' };

  const cookies = new Map(
    document.cookie
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => Boolean(key && value))
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
  );

  return {
    fbp: cookies.get('_fbp')?.slice(0, 300) ?? '',
    fbc: cookies.get('_fbc')?.slice(0, 300) ?? ''
  };
}

export function getGoogleBrowserIdentifiers(): { gaClientId: string; gaSessionId: string } {
  if (!browser || !hasAnalyticsConsent()) return { gaClientId: '', gaSessionId: '' };

  const cookies = new Map(
    document.cookie
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => Boolean(key && value))
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
  );
  const gaCookie = cookies.get('_ga') ?? '';
  const gaParts = gaCookie.split('.');
  const gaClientId = gaParts.length >= 4 ? gaParts.slice(-2).join('.').slice(0, 160) : '';

  return {
    gaClientId,
    // Session attribution is intentionally omitted: a generic _ga_* cookie can
    // belong to another property and late CRM milestones are outside the session.
    gaSessionId: ''
  };
}

export function trackMetaLead(eventId: string): void {
  trackMetaStandardEvent('Lead', {}, eventId);
}
