import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions, RequestEvent } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  deleteContactSubmission,
  findPotentialDuplicateSubmissions,
  getContactSubmission,
  getSubmissionActivities,
  PARTNER_PAYMENT_MODELS,
  recordLeadActivity,
  SUBMISSION_STATUSES,
  updateContactSubmissionPipeline,
  updateLeadNextAction,
  updateLeadOperations,
  updateLeadRevenue
} from '$lib/db/repositories/contact-submissions.js';
import {
  getOutboxEvent,
  listOutboxEventsForSubmission,
  requestOutboxRetry
} from '$lib/db/repositories/delivery-outbox.js';
import {
  enqueueCrmStageEvents,
  processCrmOutbox,
  scheduleCrmOutbox,
  type CrmEventStage
} from '$lib/server/crm/outbox.js';
import { parseTallinnDateTimeLocal } from '$lib/server/crm/tallinn-time.js';

const leadId = (event: RequestEvent) => {
  const id = Number(event.params.id);
  if (!Number.isInteger(id) || id < 1) error(404, 'Not found');
  return id;
};

const textValue = (data: FormData, key: string, max = 3_000) =>
  String(data.get(key) ?? '').trim().slice(0, max);

const moneyCents = (data: FormData, key: string) => {
  const amount = Number(textValue(data, key, 32).replace(',', '.') || '0');
  return Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000
    ? Math.round(amount * 100)
    : null;
};

const optionalNumber = (data: FormData, key: string, max = 100_000) => {
  const raw = textValue(data, key, 32).replace(',', '.');
  if (!raw) return null;
  const number = Number(raw);
  return Number.isFinite(number) && number >= 0 && number <= max ? Math.round(number) : undefined;
};

const SERVICE_TYPES = new Set(['dpf', 'fap', 'catalyst', 'diagnosis', 'other', '']);
const FILTER_STATES = new Set(['removed', 'workshop', 'installed', 'unsure', '']);
const LOSS_REASON_CODES = new Set([
  'expensive',
  'unsuitable',
  'no_answer',
  'postponed',
  'chose_other',
  'duplicate',
  'other'
]);

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const id = leadId(event);
  const db = getDb(event.platform);
  const row = await getContactSubmission(db, id);
  if (!row) error(404, 'Not found');

  const [activities, deliveries, duplicates] = await Promise.all([
    getSubmissionActivities(db, id),
    listOutboxEventsForSubmission(db, id, 50),
    findPotentialDuplicateSubmissions(db, {
      normalizedPhone: row.phoneNormalized,
      normalizedEmail: row.emailNormalized,
      excludeId: id,
      limit: 5
    })
  ]);
  return { row, activities, deliveries, duplicates };
};

export const actions: Actions = {
  pipeline: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    const data = await event.request.formData();
    const status = textValue(data, 'status', 30);
    const assignedTo = textValue(data, 'assigned_to', 160);
    const lossReasonCode = textValue(data, 'loss_reason_code', 40);
    const lossReason = textValue(data, 'loss_reason', 500);
    const adminNotes = textValue(data, 'admin_notes');
    if (!SUBMISSION_STATUSES.includes(status as (typeof SUBMISSION_STATUSES)[number])) {
      return fail(400, { section: 'pipeline', error: 'Некорректный статус' });
    }
    if (status === 'lost' && !LOSS_REASON_CODES.has(lossReasonCode)) {
      return fail(422, { section: 'pipeline', error: 'Выберите причину потери' });
    }

    const current = await getContactSubmission(db, id);
    if (!current) return fail(404, { error: 'Not found' });
    if (status === 'completed' && current.orderAmountCents <= 0) {
      return fail(422, {
        section: 'pipeline',
        error: 'Сначала сохраните цену услуги DPFLAB в блоке «Выручка DPFLAB»'
      });
    }

    const nextStatus = status as (typeof SUBMISSION_STATUSES)[number];
    await updateContactSubmissionPipeline(db, id, {
      status: nextStatus,
      assignedTo,
      orderAmountCents: current.orderAmountCents,
      lossReasonCode,
      lossReason,
      adminNotes,
      actor
    });
    if (nextStatus === 'qualified' || nextStatus === 'booked' || nextStatus === 'completed') {
      const updated = await getContactSubmission(db, id);
      if (updated) {
        const occurredAt = nextStatus === 'qualified'
          ? updated.qualifiedAt
          : nextStatus === 'booked'
            ? updated.bookedAt
            : updated.completedAt;
        await enqueueCrmStageEvents(
          db,
          updated,
          nextStatus as CrmEventStage,
          occurredAt ?? new Date()
        );
        scheduleCrmOutbox(db, event.platform?.env, event.platform?.context);
      }
    }
    console.info(`[admin] action=update domain=submission-pipeline id=${id}`);
    redirect(303, `/admin/submissions/${id}?saved=pipeline`);
  },

  revenue: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    const current = await getContactSubmission(db, id);
    if (!current) return fail(404, { error: 'Not found' });
    if (current.completedAt) {
      return fail(409, {
        section: 'revenue',
        error: 'Оплаченный заказ зафиксирован. Корректировка требует отдельной процедуры сверки.'
      });
    }
    const data = await event.request.formData();
    const orderAmountCents = moneyCents(data, 'order_amount');
    if (orderAmountCents === null) {
      return fail(422, { section: 'revenue', error: 'Проверьте цену: число от 0' });
    }
    await updateLeadRevenue(db, id, { orderAmountCents, actor });
    console.info(`[admin] action=update domain=submission-revenue id=${id}`);
    redirect(303, `/admin/submissions/${id}?saved=revenue`);
  },

  operations: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    const data = await event.request.formData();
    const serviceType = textValue(data, 'service_type', 30);
    const filterState = textValue(data, 'filter_state', 30);
    const partnerPaymentModel = textValue(data, 'partner_payment_model', 30);
    const partnerCustomerPriceCents = moneyCents(data, 'partner_customer_price');
    const pressureBeforeMbar = optionalNumber(data, 'pressure_before_mbar');
    const pressureAfterMbar = optionalNumber(data, 'pressure_after_mbar');
    if (!SERVICE_TYPES.has(serviceType) || !FILTER_STATES.has(filterState)) {
      return fail(422, { section: 'operations', error: 'Проверьте услугу и маршрут фильтра' });
    }
    if (!PARTNER_PAYMENT_MODELS.includes(partnerPaymentModel as (typeof PARTNER_PAYMENT_MODELS)[number])) {
      return fail(422, { section: 'operations', error: 'Проверьте схему оплаты партнёра' });
    }
    if (partnerCustomerPriceCents === null || pressureBeforeMbar === undefined || pressureAfterMbar === undefined) {
      return fail(422, { section: 'operations', error: 'Проверьте числовые значения' });
    }
    await updateLeadOperations(db, id, {
      serviceType,
      filterState,
      vehicle: textValue(data, 'vehicle', 240),
      registrationNumber: textValue(data, 'registration_number', 40),
      partNumber: textValue(data, 'part_number', 120),
      diagnosticCode: textValue(data, 'diagnostic_code', 240),
      pressureBeforeMbar,
      pressureAfterMbar,
      partnerWorkshop: textValue(data, 'partner_workshop', 160),
      partnerContact: textValue(data, 'partner_contact', 160),
      partnerCustomerPriceCents,
      partnerPaymentModel: partnerPaymentModel as (typeof PARTNER_PAYMENT_MODELS)[number],
      pickupAddress: textValue(data, 'pickup_address', 500),
      actor
    });
    redirect(303, `/admin/submissions/${id}?saved=operations`);
  },

  nextAction: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    const data = await event.request.formData();
    const rawAt = textValue(data, 'next_action_at', 32);
    const note = textValue(data, 'next_action_note', 500);
    const nextActionAt = rawAt ? parseTallinnDateTimeLocal(rawAt) : null;
    if (rawAt && !nextActionAt) {
      return fail(422, { section: 'nextAction', error: 'Проверьте дату и время' });
    }
    if (nextActionAt && !note) {
      return fail(422, { section: 'nextAction', error: 'Напишите, что нужно сделать' });
    }
    await updateLeadNextAction(db, id, { nextActionAt, nextActionNote: note, actor });
    console.info(`[admin] action=update domain=submission-next-action id=${id}`);
    redirect(303, `/admin/submissions/${id}?saved=next-action`);
  },

  addNote: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    const note = textValue(await event.request.formData(), 'activity_note', 1_500);
    if (!note) return fail(422, { section: 'activity', error: 'Заметка пустая' });
    await recordLeadActivity(db, {
      submissionId: id,
      activityType: 'note_added',
      actor,
      details: { note }
    });
    redirect(303, `/admin/submissions/${id}?saved=note`);
  },

  retryDelivery: async (event) => {
    requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    const deliveryId = Number(textValue(await event.request.formData(), 'delivery_id', 20));
    const delivery = await getOutboxEvent(db, deliveryId);
    if (!delivery || delivery.submissionId !== id) {
      return fail(404, { section: 'delivery', error: 'Событие не найдено' });
    }
    if (!(await requestOutboxRetry(db, deliveryId))) {
      return fail(409, { section: 'delivery', error: 'Это событие уже отправляется или закрыто' });
    }
    const stats = await processCrmOutbox(db, event.platform?.env ?? {}, { onlyId: deliveryId });
    redirect(303, `/admin/submissions/${id}?delivery=${stats.delivered ? 'sent' : 'pending'}`);
  },

  delete: async (event) => {
    requireAdmin(event);
    const db = getDb(event.platform);
    const id = leadId(event);
    await deleteContactSubmission(db, id);
    console.info(`[admin] action=delete domain=submissions id=${id}`);
    redirect(303, '/admin/submissions');
  }
};
