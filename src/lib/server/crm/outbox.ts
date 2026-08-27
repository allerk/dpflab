import type { ExecutionContext } from '@cloudflare/workers-types';
import type { Db } from '$lib/db/types';
import {
  getContactSubmission,
  getContactSubmissionsUpdatedSince,
  type SubmissionRow
} from '$lib/db/repositories/contact-submissions';
import {
  enqueueDeliveryEvent,
  getOutboxEvent,
  listPendingOutboxEvents,
  markOutboxAttemptStarted,
  markOutboxDelivered,
  markOutboxFailed,
  markOutboxSkipped,
  recoverStaleOutboxAttempts,
  type DeliveryOutboxRow
} from '$lib/db/repositories/delivery-outbox';
import { sendGoogleCrmEvent, type GoogleGa4Env } from '$lib/server/analytics/google-ga4';
import { sendMetaCrmEvent, type MetaCapiEnv } from '$lib/server/analytics/meta-capi';

export type CrmEventStage = 'lead_created' | 'qualified' | 'booked' | 'completed';
type CrmOutboxPayload = { stage: CrmEventStage; occurredAt: string };
export type CrmDeliveryEnv = MetaCapiEnv & GoogleGa4Env;

const eligibleProviders = (row: SubmissionRow, stage: CrmEventStage) => {
  const providers: Array<'meta' | 'google'> = [];
  if (row.analyticsConsent) providers.push('google');
  if (
    stage !== 'lead_created' &&
    ((row.origin === 'site' && row.analyticsConsent) || row.origin === 'meta_instant')
  ) {
    providers.push('meta');
  }
  return providers;
};

/** Writes provider deliveries before network I/O. Provider+key uniqueness makes retries safe. */
export async function enqueueCrmStageEvents(
  db: Db,
  row: SubmissionRow,
  stage: CrmEventStage,
  occurredAt = new Date()
): Promise<number[]> {
  const ids: number[] = [];
  for (const provider of eligibleProviders(row, stage)) {
    const result = await enqueueDeliveryEvent(db, {
      submissionId: row.id,
      provider,
      eventName: stage,
      dedupeKey: `submission:${row.id}:${stage}`,
      payload: { stage, occurredAt: occurredAt.toISOString() } satisfies CrmOutboxPayload
    });
    ids.push(result.id);
  }
  return ids;
}

const parsePayload = (row: DeliveryOutboxRow): CrmOutboxPayload | null => {
  try {
    const value = JSON.parse(row.payloadJson) as Partial<CrmOutboxPayload>;
    if (
      !['lead_created', 'qualified', 'booked', 'completed'].includes(value.stage ?? '') ||
      !value.occurredAt ||
      Number.isNaN(new Date(value.occurredAt).getTime())
    ) {
      return null;
    }
    return value as CrmOutboxPayload;
  } catch {
    return null;
  }
};

const retryAt = (attempt: number) => {
  const minutes = Math.min(24 * 60, 2 ** Math.min(attempt, 10));
  return new Date(Date.now() + minutes * 60_000);
};

export type CrmOutboxStats = { delivered: number; deferred: number; failed: number; skipped: number };

export async function processCrmOutbox(
  db: Db,
  env: CrmDeliveryEnv,
  options: { limit?: number; onlyId?: number } = {}
): Promise<CrmOutboxStats> {
  await recoverStaleOutboxAttempts(db, {
    staleBefore: new Date(Date.now() - 10 * 60_000),
    reason: 'processing_lease_expired'
  });
  const rows = options.onlyId
    ? [await getOutboxEvent(db, options.onlyId)].filter(
        (row): row is DeliveryOutboxRow => Boolean(row)
      )
    : await listPendingOutboxEvents(db, { limit: options.limit ?? 20 });
  const stats: CrmOutboxStats = { delivered: 0, deferred: 0, failed: 0, skipped: 0 };

  for (const outbox of rows) {
    if (!(await markOutboxAttemptStarted(db, outbox.id))) continue;
    const payload = parsePayload(outbox);
    if (!payload || !outbox.submissionId) {
      await markOutboxFailed(db, outbox.id, {
        error: 'invalid_outbox_payload',
        nextAttemptAt: retryAt(outbox.attemptCount + 1),
        dead: true
      });
      stats.failed += 1;
      continue;
    }

    const submission = await getContactSubmission(db, outbox.submissionId);
    if (!submission) {
      await markOutboxFailed(db, outbox.id, {
        error: 'submission_not_found',
        nextAttemptAt: retryAt(outbox.attemptCount + 1),
        dead: true
      });
      stats.failed += 1;
      continue;
    }

    if (outbox.provider === 'google') {
      const result = await sendGoogleCrmEvent(
        {
          stage: payload.stage,
          outboxEventId: `outbox:${outbox.id}`,
          occurredAt: payload.occurredAt,
          leadKey: `${submission.origin}:${submission.id}`,
          analyticsConsent: submission.analyticsConsent,
          adUserDataConsent: false,
          adPersonalizationConsent: false,
          clientId: submission.gaClientId,
          sessionId: payload.stage === 'lead_created' ? submission.gaSessionId : undefined,
          leadSource: submission.source,
          serviceType: submission.serviceType,
          locale: submission.locale,
          valueCents: payload.stage === 'completed' ? submission.orderAmountCents : undefined,
          currency: 'EUR'
        },
        env
      );
      if (result.outcome === 'skipped') {
        await markOutboxSkipped(db, outbox.id, result.reason);
        stats.skipped += 1;
      } else if (result.acknowledge) {
        await markOutboxDelivered(db, outbox.id);
        stats.delivered += 1;
      } else {
        const dead = result.outcome === 'failed' && !result.retryable;
        await markOutboxFailed(db, outbox.id, {
          error: result.outcome === 'deferred' ? result.reason : 'google_delivery_failed',
          nextAttemptAt: retryAt(outbox.attemptCount + 1),
          dead
        });
        if (result.outcome === 'deferred') stats.deferred += 1;
        else stats.failed += 1;
      }
      continue;
    }

    if (payload.stage === 'lead_created') {
      await markOutboxDelivered(db, outbox.id);
      stats.delivered += 1;
      continue;
    }
    const result = await sendMetaCrmEvent(
      {
        stage: payload.stage,
        eventId: `crm-lead-${submission.id}-${payload.stage}`,
        occurredAt: payload.occurredAt,
        origin: submission.origin,
        externalLeadId: submission.externalLeadId,
        landingPage: submission.landingPage,
        name: submission.name,
        phone: submission.phone,
        email: submission.email,
        locale: submission.locale,
        serviceType: submission.serviceType,
        fbp: submission.fbp,
        fbc: submission.fbc,
        analyticsConsent: submission.analyticsConsent,
        orderAmountCents: submission.orderAmountCents
      },
      env
    );
    if (result.outcome === 'skipped') {
      await markOutboxSkipped(db, outbox.id, result.reason);
      stats.skipped += 1;
    } else if (result.acknowledge) {
      await markOutboxDelivered(db, outbox.id);
      stats.delivered += 1;
    } else {
      const dead = result.outcome === 'failed' && !result.retryable;
      await markOutboxFailed(db, outbox.id, {
        error: result.outcome === 'deferred' ? result.reason : 'meta_delivery_failed',
        nextAttemptAt: retryAt(outbox.attemptCount + 1),
        dead
      });
      if (result.outcome === 'deferred') stats.deferred += 1;
      else stats.failed += 1;
    }
  }
  return stats;
}

/** Repairs missing outbox rows after a partial write before draining retries. */
export async function reconcileCrmOutbox(
  db: Db,
  input: { since?: Date; limit?: number } = {}
): Promise<number> {
  const rows = await getContactSubmissionsUpdatedSince(db, {
    since: input.since ?? new Date(Date.now() - 7 * 24 * 60 * 60_000),
    limit: input.limit ?? 2_000
  });
  let touched = 0;
  for (const row of rows) {
    const stages: Array<[CrmEventStage, Date | null]> = [
      ['lead_created', row.createdAt],
      ['qualified', row.qualifiedAt],
      ['booked', row.bookedAt],
      ['completed', row.completedAt]
    ];
    for (const [stage, occurredAt] of stages) {
      if (!occurredAt) continue;
      touched += (await enqueueCrmStageEvents(db, row, stage, occurredAt)).length;
    }
  }
  return touched;
}

export function scheduleCrmOutbox(
  db: Db,
  env: CrmDeliveryEnv | undefined,
  context?: ExecutionContext
): void {
  if (!env) return;
  const task = processCrmOutbox(db, env).catch(() => {
    console.error('[crm-outbox] processing failed');
  });
  if (context?.waitUntil) context.waitUntil(task);
}
