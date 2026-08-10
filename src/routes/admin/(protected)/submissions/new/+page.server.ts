import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getDb } from '$lib/db';
import {
  createCrmLead,
  findPotentialDuplicateSubmissions,
  recordLeadActivity,
  type LeadOrigin
} from '$lib/db/repositories/contact-submissions';
import { requireAdmin } from '$lib/server/admin/require-admin';

const MANUAL_ORIGINS = new Set<LeadOrigin>(['manual', 'whatsapp']);
const SERVICE_TYPES = new Set(['dpf', 'fap', 'catalyst', 'diagnosis', 'other']);
const CLIENT_TYPES = new Set(['private', 'workshop', 'fleet', '']);
const FILTER_STATES = new Set(['removed', 'workshop', 'installed', 'unsure']);

const value = (data: FormData, key: string, limit = 500) =>
  String(data.get(key) ?? '').trim().slice(0, limit);

export const actions: Actions = {
  default: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const origin = value(data, 'origin', 30) as LeadOrigin;
    const name = value(data, 'name', 100);
    const phone = value(data, 'phone', 40);
    const email = value(data, 'email', 160);
    const source = value(data, 'source', 120);
    const vehicle = value(data, 'vehicle', 240);
    const registrationNumber = value(data, 'registration_number', 40);
    const serviceType = value(data, 'service_type', 30);
    const filterState = value(data, 'filter_state', 30);
    const clientType = value(data, 'client_type', 30);
    const comment = value(data, 'comment', 1500);
    const assignedTo = value(data, 'assigned_to', 160);
    const confirmDuplicate = data.get('confirm_duplicate') === 'yes';

    const values = {
      origin,
      name,
      phone,
      email,
      source,
      vehicle,
      registrationNumber,
      serviceType,
      filterState,
      clientType,
      comment,
      assignedTo
    };
    const errors: Record<string, string> = {};
    if (!MANUAL_ORIGINS.has(origin)) errors.origin = 'Выберите источник';
    if (!name) errors.name = 'Укажите имя или название компании';
    if (!phone && !email) errors.phone = 'Укажите телефон или e-mail';
    if (phone && !/^[+\d\s\-()]{6,}$/.test(phone)) errors.phone = 'Проверьте номер';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Проверьте e-mail';
    if (!SERVICE_TYPES.has(serviceType)) errors.serviceType = 'Выберите услугу';
    if (!FILTER_STATES.has(filterState)) errors.filterState = 'Выберите, где находится фильтр';
    if (!CLIENT_TYPES.has(clientType)) errors.clientType = 'Некорректный тип клиента';
    if (Object.keys(errors).length) return fail(422, { errors, values });

    const duplicates = await findPotentialDuplicateSubmissions(db, { phone, email, limit: 5 });
    if (duplicates.length && !confirmDuplicate) {
      return fail(409, {
        duplicateWarning: true,
        duplicates: duplicates.map((row) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          status: row.status,
          createdAt: row.createdAt
        })),
        values
      });
    }

    const created = await createCrmLead(db, {
      origin,
      source: source || origin,
      name,
      phone,
      email,
      vehicle,
      registrationNumber,
      serviceType,
      filterState,
      partnerPaymentModel: filterState === 'installed' ? 'customer_direct' : 'not_applicable',
      clientType,
      comment,
      assignedTo,
      preferredContact: origin === 'whatsapp' ? 'whatsapp' : phone ? 'phone' : 'email',
      privacyVersion: 'staff-entered',
      analyticsConsent: false,
      locale: 'ru'
    });
    await recordLeadActivity(db, {
      submissionId: created.id,
      activityType: 'staff_lead_created',
      actor,
      details: { origin, source: source || origin }
    });

    console.info(`[admin] action=create domain=submissions id=${created.id}`);
    redirect(303, `/admin/submissions/${created.id}`);
  }
};
