import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  getContactSubmission,
  deleteContactSubmission,
  SUBMISSION_STATUSES,
  updateContactSubmissionPipeline
} from '$lib/db/repositories/contact-submissions.js';
import { scheduleMetaPipelineEvent } from '$lib/server/analytics/meta-capi.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const id = Number(event.params.id);
  if (!Number.isInteger(id) || id < 1) error(404, 'Not found');

  const db = getDb(event.platform);
  const row = await getContactSubmission(db, id);
  if (!row) error(404, 'Not found');

  return { row };
};

export const actions: Actions = {
  pipeline: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = Number(event.params.id);
    if (!Number.isInteger(id) || id < 1) return fail(400, { error: 'Invalid id' });

    const data = await event.request.formData();
    const status = String(data.get('status') ?? '');
    const assignedTo = String(data.get('assigned_to') ?? '').trim().slice(0, 160);
    const amount = Number(String(data.get('order_amount') ?? '').trim().replace(',', '.') || '0');
    const lossReason = String(data.get('loss_reason') ?? '').trim().slice(0, 500);
    const adminNotes = String(data.get('admin_notes') ?? '').trim().slice(0, 3000);

    if (!SUBMISSION_STATUSES.includes(status as (typeof SUBMISSION_STATUSES)[number])) {
      return fail(400, { error: 'Invalid status' });
    }
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
      return fail(400, { error: 'Invalid amount' });
    }
    if (status === 'lost' && !lossReason) {
      return fail(400, { error: 'Loss reason is required' });
    }

    const current = await getContactSubmission(db, id);
    if (!current) return fail(404, { error: 'Not found' });

    const nextStatus = status as (typeof SUBMISSION_STATUSES)[number];
    const orderAmountCents = Math.round(amount * 100);
    await updateContactSubmissionPipeline(db, id, {
      status: nextStatus,
      assignedTo,
      orderAmountCents,
      lossReason,
      adminNotes
    });

    if (
      current.status !== nextStatus &&
      (nextStatus === 'qualified' || nextStatus === 'booked' || nextStatus === 'completed')
    ) {
      await scheduleMetaPipelineEvent({
        stage: nextStatus,
        submissionId: id,
        request: event.request,
        landingPage: current.landingPage,
        name: current.name,
        phone: current.phone,
        email: current.email,
        locale: current.locale,
        serviceType: current.serviceType,
        fbp: current.fbp,
        fbc: current.fbc,
        analyticsConsent: current.analyticsConsent,
        orderAmountCents,
        env: event.platform?.env,
        context: event.platform?.context
      });
    }
    console.info(`[admin] action=update domain=submission-pipeline id=${id} email=${email}`);
    redirect(303, `/admin/submissions/${id}`);
  },
  delete: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = Number(event.params.id);
    if (!Number.isInteger(id) || id < 1) return fail(400, { error: 'Invalid id' });

    await deleteContactSubmission(db, id);
    console.info(`[admin] action=delete domain=submissions id=${id} email=${email}`);
    redirect(303, '/admin/submissions');
  }
};
