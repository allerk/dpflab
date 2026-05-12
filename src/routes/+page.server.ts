import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db/index';
import { getFaqItems } from '$lib/db/repositories/faq';
import { getReviews } from '$lib/db/repositories/reviews';
import { getPricingItems } from '$lib/db/repositories/pricing';
import { getCertificates } from '$lib/db/repositories/certificates';
import { getContacts } from '$lib/db/repositories/contacts';
import { createContactSubmission } from '$lib/db/repositories/contact-submissions';

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale;

  try {
    const [faqItems, reviewItems, pricingItems, certificateItems, contactsRow] = await Promise.all([
      getFaqItems(db, locale),
      getReviews(db, locale),
      getPricingItems(db, locale),
      getCertificates(db, locale),
      getContacts(db, locale)
    ]);

    return { faqItems, reviewItems, pricingItems, certificateItems, contactsRow };
  } catch {
    return {
      faqItems: [],
      reviewItems: [],
      pricingItems: [],
      certificateItems: [],
      contactsRow: null
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const name = (data.get('name') as string | null)?.trim() ?? '';
    const phone = (data.get('phone') as string | null)?.trim() ?? '';
    const comment = (data.get('comment') as string | null)?.trim() ?? '';

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'required';
    if (!/^[\+\d\s\-()Ѐ-ӿ]{6,}$/.test(phone)) errors.phone = 'required';

    if (Object.keys(errors).length > 0) {
      return fail(422, { errors, name, phone, comment });
    }

    await createContactSubmission(db, { name, phone, comment, locale: locals.locale });

    return { success: true };
  }
};
