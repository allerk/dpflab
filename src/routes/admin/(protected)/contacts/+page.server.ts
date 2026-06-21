import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import { getContacts, updateContacts } from '$lib/db/repositories/contacts.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const contacts = await getContacts(db);
  return { contacts };
};

export const actions: Actions = {
  update: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();

    const phone = (data.get('phone') as string)?.trim() ?? '';
    const phoneHref = (data.get('phone_href') as string)?.trim() ?? '';
    const whatsapp = (data.get('whatsapp') as string)?.trim() ?? '';
    const emailVal = (data.get('email') as string)?.trim() ?? '';
    const address = (data.get('address') as string)?.trim() ?? '';
    const weekdaysOpen = (data.get('weekdays_open') as string)?.trim() ?? '';
    const weekdaysClose = (data.get('weekdays_close') as string)?.trim() ?? '';
    const saturdayOpen = (data.get('saturday_open') as string)?.trim() || null;
    const saturdayClose = (data.get('saturday_close') as string)?.trim() || null;

    const errors: Record<string, string> = {};
    if (!phone) errors.phone = 'required';
    if (!phoneHref) errors.phone_href = 'required';
    if (!whatsapp) errors.whatsapp = 'required';
    if (!emailVal) errors.email = 'required';
    if (!address) errors.address = 'required';
    if (!weekdaysOpen) errors.weekdays_open = 'required';
    if (!weekdaysClose) errors.weekdays_close = 'required';

    if (Object.keys(errors).length) {
      return fail(400, {
        errors,
        values: { phone, phoneHref, whatsapp, email: emailVal, address, weekdaysOpen, weekdaysClose, saturdayOpen, saturdayClose }
      });
    }

    await updateContacts(db, {
      phone,
      phoneHref,
      whatsapp,
      email: emailVal,
      address,
      weekdaysOpen,
      weekdaysClose,
      saturdayOpen,
      saturdayClose
    });
    console.info(`[admin] action=update domain=contacts email=${email}`);
    redirect(303, '/admin/contacts');
  }
};
