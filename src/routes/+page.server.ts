import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/db/index';
import { getFaqItems } from '$lib/db/repositories/faq';
import { getPricingItems } from '$lib/db/repositories/pricing';
import { getContacts } from '$lib/db/repositories/contacts';
import {
  getBeforeAfterRows,
  type BeforeAfterRow
} from '$lib/db/repositories/before-after';
import { createContactSubmission } from '$lib/db/repositories/contact-submissions';
import { getSiteImages } from '$lib/db/repositories/site-images';
import type { SiteImagesMap } from '$lib/db/repositories/site-images';
import { scheduleContactSubmissionNotification } from '$lib/server/notifications/contact-submission';
import { scheduleMetaLeadEvent } from '$lib/server/analytics/meta-capi';

const PRIVACY_VERSION = '2026-07-23';
const CLIENT_TYPES = new Set(['private', 'workshop', 'fleet']);
const SERVICE_TYPES = new Set(['dpf', 'fap', 'catalyst', 'diagnosis', 'other']);
const FILTER_STATES = new Set(['removed', 'workshop', 'installed', 'unsure']);
const URGENCY_OPTIONS = new Set(['today', 'days_1_3', 'this_week', 'consultation']);
const CONTACT_OPTIONS = new Set(['phone', 'whatsapp', 'email']);
const SYMPTOM_OPTIONS = new Set(['warning', 'power', 'regeneration', 'smoke', 'other']);

const DEVELOP_SITE_IMAGE_FALLBACKS: Pick<SiteImagesMap, 'hero_main' | 'why_main'> = {
  hero_main: 'https://dpflab.ee/images/E5470B3C-B3BA-461A-8393-FC02A1EC1AF7.PNG',
  why_main:
    'https://dpflab.ee/images/%D0%94%D0%B8%D0%B7%D0%B0%D0%B8%CC%86%D0%BD%20%D0%B1%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-5.png'
};

const DEVELOP_BEFORE_AFTER_FALLBACK: BeforeAfterRow = {
  id: -1,
  sliderEnabled: false,
  imageBefore: 'https://dpflab.ee/images/2026-06-21%2020.04.06%20(1).jpg',
  imageAfter: null,
  sortOrder: 1
};

const displaySiteImages = (
  appEnv: string | undefined,
  siteImagesMap: SiteImagesMap
): SiteImagesMap =>
  appEnv === 'develop'
    ? {
        ...siteImagesMap,
        hero_main: siteImagesMap.hero_main ?? DEVELOP_SITE_IMAGE_FALLBACKS.hero_main,
        why_main: siteImagesMap.why_main ?? DEVELOP_SITE_IMAGE_FALLBACKS.why_main
      }
    : siteImagesMap;

const displayBeforeAfter = (
  appEnv: string | undefined,
  beforeAfterItems: BeforeAfterRow[]
): BeforeAfterRow[] =>
  appEnv === 'develop' && beforeAfterItems.length === 0
    ? [DEVELOP_BEFORE_AFTER_FALLBACK]
    : beforeAfterItems;

const textValue = (data: FormData, key: string, maxLength = 500) =>
  ((data.get(key) as string | null)?.trim() ?? '').slice(0, maxLength);

export const load: PageServerLoad = async ({ locals, platform }) => {
  const locale = locals.locale;
  const db = getDb(platform);
  const configuredPixelId = platform?.env?.META_PIXEL_ID;
  const metaPixelId = configuredPixelId && /^\d{5,20}$/.test(configuredPixelId)
    ? configuredPixelId
    : undefined;

  try {
    const [faqItems, pricingItems, contactsRow, beforeAfterItems, siteImagesMap] =
      await Promise.all([
        getFaqItems(db, locale),
        getPricingItems(db, locale),
        getContacts(db),
        getBeforeAfterRows(db),
        getSiteImages(db)
      ]);

    return {
      locale,
      faqItems,
      pricingItems,
      contactsRow,
      beforeAfterItems: displayBeforeAfter(platform?.env?.APP_ENV, beforeAfterItems),
      siteImagesMap: displaySiteImages(platform?.env?.APP_ENV, siteImagesMap),
      metaPixelId
    };
  } catch {
    const emptySiteImages: SiteImagesMap = {
      hero_main: null,
      why_main: null,
      contact_workshop: null
    };

    return {
      locale,
      faqItems: [],
      pricingItems: [],
      contactsRow: null,
      beforeAfterItems: displayBeforeAfter(platform?.env?.APP_ENV, []),
      siteImagesMap: displaySiteImages(platform?.env?.APP_ENV, emptySiteImages),
      metaPixelId
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals, platform }) => {
    const db = getDb(platform);
    const data = await request.formData();
    const name = textValue(data, 'name', 100);
    const phone = textValue(data, 'phone', 40);
    const email = textValue(data, 'email', 160);
    const comment = textValue(data, 'comment', 1500);
    const clientType = textValue(data, 'clientType', 30);
    const serviceType = textValue(data, 'serviceType', 30);
    const filterState = textValue(data, 'filterState', 30);
    const vehicle = textValue(data, 'vehicle', 240);
    const urgency = textValue(data, 'urgency', 30);
    const preferredContact = textValue(data, 'preferredContact', 30);
    const symptoms = data
      .getAll('symptoms')
      .map((value) => String(value))
      .filter((value) => SYMPTOM_OPTIONS.has(value));
    const privacyAccepted = data.get('privacyAccepted') === 'yes';
    const analyticsConsent = data.get('analyticsConsent') === 'yes';
    const website = textValue(data, 'website', 200);

    const attribution = {
      utmSource: textValue(data, 'utmSource', 160),
      utmMedium: textValue(data, 'utmMedium', 160),
      utmCampaign: textValue(data, 'utmCampaign', 240),
      utmContent: textValue(data, 'utmContent', 240),
      utmTerm: textValue(data, 'utmTerm', 240),
      utmId: textValue(data, 'utmId', 240),
      campaignId: textValue(data, 'campaignId', 120),
      adsetId: textValue(data, 'adsetId', 120),
      adId: textValue(data, 'adId', 120),
      fbclid: textValue(data, 'fbclid', 300),
      fbp: textValue(data, 'fbp', 300),
      fbc: textValue(data, 'fbc', 300),
      landingPage: textValue(data, 'landingPage', 500),
      referrer: textValue(data, 'referrer', 500)
    };

    // Honeypot: bots see a successful response but no personal data is stored.
    if (website) return { success: true };

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'required';
    if (!/^[+\d\s\-()]{6,}$/.test(phone)) errors.phone = 'required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'invalid';
    if (preferredContact === 'email' && !email) errors.email = 'required';
    if (!CLIENT_TYPES.has(clientType)) errors.clientType = 'required';
    if (!SERVICE_TYPES.has(serviceType)) errors.serviceType = 'required';
    if (!FILTER_STATES.has(filterState)) errors.filterState = 'required';
    if (!vehicle) errors.vehicle = 'required';
    if (!URGENCY_OPTIONS.has(urgency)) errors.urgency = 'required';
    if (!CONTACT_OPTIONS.has(preferredContact)) errors.preferredContact = 'required';
    if (!privacyAccepted) errors.privacyAccepted = 'required';

    if (Object.keys(errors).length > 0) {
      return fail(422, {
        errors,
        values: {
          name,
          phone,
          email,
          comment,
          clientType,
          serviceType,
          filterState,
          vehicle,
          symptoms,
          urgency,
          preferredContact,
          privacyAccepted
        }
      });
    }

    const id = await createContactSubmission(db, {
      name,
      phone,
      email,
      comment,
      clientType,
      serviceType,
      filterState,
      vehicle,
      symptoms: JSON.stringify(symptoms),
      urgency,
      preferredContact,
      ...attribution,
      privacyVersion: PRIVACY_VERSION,
      analyticsConsent,
      locale: locals.locale
    });
    const eventId = `site-lead-${id}`;
    await Promise.all([
      scheduleContactSubmissionNotification({
        id,
        origin: new URL(request.url).origin,
        env: platform?.env,
        context: platform?.context
      }),
      scheduleMetaLeadEvent({
        eventId,
        request,
        name,
        phone,
        email,
        locale: locals.locale,
        serviceType,
        fbp: attribution.fbp,
        fbc: attribution.fbc,
        analyticsConsent,
        env: platform?.env,
        context: platform?.context
      })
    ]);

    return { success: true, eventId };
  }
};
