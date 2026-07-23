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
};

export function getConsentChoice(): ConsentChoice | null {
  if (!browser) return null;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === 'accepted' || stored === 'necessary' ? stored : null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsentChoice() === 'accepted';
}

export function setConsentChoice(choice: ConsentChoice): void {
  if (!browser) return;
  window.localStorage.setItem(CONSENT_KEY, choice);
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
  if (analyticsWindow.fbq) return;

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
  fbq('track', 'PageView');
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

export function trackMetaLead(eventId: string): void {
  if (!browser || !hasAnalyticsConsent()) return;
  const fbq = (window as AnalyticsWindow).fbq;
  fbq?.('track', 'Lead', {}, { eventID: eventId });
}
