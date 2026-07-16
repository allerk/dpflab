import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/db/index';
import { getFaqItems } from '$lib/db/repositories/faq';
import { getPricingItems } from '$lib/db/repositories/pricing';
import { getContacts } from '$lib/db/repositories/contacts';
import { getBeforeAfterRows } from '$lib/db/repositories/before-after';
import { createContactSubmission } from '$lib/db/repositories/contact-submissions';
import { getSiteImages } from '$lib/db/repositories/site-images';
import { scheduleContactSubmissionNotification } from '$lib/server/notifications/contact-submission';

export const load: PageServerLoad = async ({ locals, platform }) => {
  const locale = locals.locale;
  const db = getDb(platform);

  try {
    const [faqItems, pricingItems, contactsRow, beforeAfterItems, siteImagesMap] =
      await Promise.all([
        getFaqItems(db, locale),
        getPricingItems(db, locale),
        getContacts(db),
        getBeforeAfterRows(db),
        getSiteImages(db)
      ]);

    return { locale, faqItems, pricingItems, contactsRow, beforeAfterItems, siteImagesMap };
  } catch {
    return {
      locale,
      faqItems: [],
      pricingItems: [],
      contactsRow: null,
      beforeAfterItems: [],
      siteImagesMap: { hero_main: null, why_main: null, contact_workshop: null }
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals, platform }) => {
    const db = getDb(platform);
    const data = await request.formData();
    const name = (data.get('name') as string | null)?.trim() ?? '';
    const phone = (data.get('phone') as string | null)?.trim() ?? '';
    const email = (data.get('email') as string | null)?.trim() ?? '';
    const comment = (data.get('comment') as string | null)?.trim() ?? '';

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'required';
    if (!/^[\+\d\s\-()Ѐ-ӿ]{6,}$/.test(phone)) errors.phone = 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'required';

    if (Object.keys(errors).length > 0) {
      return fail(422, { errors, name, phone, email, comment });
    }

    const id = await createContactSubmission(db, { name, phone, email, comment, locale: locals.locale });
    await scheduleContactSubmissionNotification({
      id,
      origin: new URL(request.url).origin,
      env: platform?.env,
      context: platform?.context
    });

    return { success: true };
  }
};
