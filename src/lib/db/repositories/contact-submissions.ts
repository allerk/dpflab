import { and, desc, eq, gte, isNull, lte, ne, or } from 'drizzle-orm';
import type { Db } from '../types';
import { contactSubmissions, leadActivities } from '../schema';

export const LEAD_ORIGINS = ['site', 'meta_instant', 'whatsapp', 'manual'] as const;
export type LeadOrigin = (typeof LEAD_ORIGINS)[number];

export const SUBMISSION_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'booked',
  'completed',
  'lost'
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type SubmissionInput = {
  name: string;
  phone: string;
  email: string;
  comment?: string;
  clientType: string;
  serviceType: string;
  filterState: string;
  vehicle: string;
  symptoms?: string;
  urgency: string;
  preferredContact: string;
  origin?: LeadOrigin;
  source?: string;
  externalLeadId?: string;
  externalFormId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  utmId?: string;
  campaignId?: string;
  adsetId?: string;
  adId?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  gaClientId?: string;
  gaSessionId?: string;
  landingPage?: string;
  referrer?: string;
  privacyVersion: string;
  analyticsConsent?: boolean;
  locale: string;
};

export type CrmLeadInput = {
  origin: LeadOrigin;
  source?: string;
  externalLeadId?: string;
  externalFormId?: string;
  name?: string;
  phone?: string;
  email?: string;
  comment?: string;
  clientType?: string;
  serviceType?: string;
  filterState?: string;
  vehicle?: string;
  symptoms?: string;
  urgency?: string;
  preferredContact?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  utmId?: string;
  campaignId?: string;
  adsetId?: string;
  adId?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  gaClientId?: string;
  gaSessionId?: string;
  landingPage?: string;
  referrer?: string;
  privacyVersion?: string;
  analyticsConsent?: boolean;
  status?: SubmissionStatus;
  assignedTo?: string;
  orderAmountCents?: number;
  partsMaterialsCostCents?: number;
  laborCostCents?: number;
  logisticsCostCents?: number;
  otherCostCents?: number;
  locale?: string;
  createdAt?: Date;
};

export type SubmissionRow = typeof contactSubmissions.$inferSelect;

export type SubmissionPipelineInput = {
  status: SubmissionStatus;
  assignedTo: string;
  orderAmountCents: number;
  lossReason: string;
  adminNotes: string;
  actor?: string;
};

export type LeadFinancialsInput = {
  orderAmountCents: number;
  partsMaterialsCostCents: number;
  laborCostCents: number;
  logisticsCostCents: number;
  otherCostCents: number;
  actor?: string;
};

export type LeadNextActionInput = {
  nextActionAt: Date | null;
  nextActionNote: string;
  actor?: string;
};

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('372')) return `+${digits}`;
  if (digits.length === 7 || digits.length === 8) return `+372${digits}`;
  return digits;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase('en-US');
}

function nonNegativeInteger(value: number | undefined): number {
  return Math.max(0, Math.round(value ?? 0));
}

function deriveSource(input: {
  origin: LeadOrigin;
  source?: string;
  utmSource?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
}): string {
  if (input.source?.trim()) return input.source.trim();
  if (input.utmSource?.trim()) return input.utmSource.trim();
  if (input.gclid || input.gbraid || input.wbraid) return 'google';
  if (input.fbclid || input.fbp || input.fbc) return 'meta';
  return input.origin === 'site' ? 'direct' : input.origin;
}

export async function createContactSubmission(db: Db, input: SubmissionInput): Promise<number> {
  const result = await createCrmLead(db, {
    ...input,
    origin: input.origin ?? 'site'
  });
  return result.id;
}

/**
 * Creates any CRM lead and makes external imports idempotent by origin + externalLeadId.
 * Existing external leads are returned untouched so webhook retries cannot overwrite work.
 */
export async function createCrmLead(
  db: Db,
  input: CrmLeadInput
): Promise<{ id: number; created: boolean }> {
  const phone = input.phone?.trim() ?? '';
  const email = input.email?.trim() ?? '';
  const externalLeadId = input.externalLeadId?.trim() ?? '';
  const now = input.createdAt ?? new Date();
  const [created] = await db
    .insert(contactSubmissions)
    .values({
      name: input.name?.trim() ?? '',
      phone,
      email,
      phoneNormalized: normalizePhone(phone),
      emailNormalized: normalizeEmail(email),
      comment: input.comment ?? '',
      clientType: input.clientType ?? '',
      serviceType: input.serviceType ?? '',
      filterState: input.filterState ?? '',
      vehicle: input.vehicle ?? '',
      symptoms: input.symptoms ?? '',
      urgency: input.urgency ?? '',
      preferredContact: input.preferredContact ?? '',
      origin: input.origin,
      source: deriveSource(input),
      externalLeadId,
      externalFormId: input.externalFormId?.trim() ?? '',
      utmSource: input.utmSource ?? '',
      utmMedium: input.utmMedium ?? '',
      utmCampaign: input.utmCampaign ?? '',
      utmContent: input.utmContent ?? '',
      utmTerm: input.utmTerm ?? '',
      utmId: input.utmId ?? '',
      campaignId: input.campaignId ?? '',
      adsetId: input.adsetId ?? '',
      adId: input.adId ?? '',
      fbclid: input.fbclid ?? '',
      fbp: input.fbp ?? '',
      fbc: input.fbc ?? '',
      gclid: input.gclid ?? '',
      gbraid: input.gbraid ?? '',
      wbraid: input.wbraid ?? '',
      gaClientId: input.gaClientId ?? '',
      gaSessionId: input.gaSessionId ?? '',
      landingPage: input.landingPage ?? '',
      referrer: input.referrer ?? '',
      privacyVersion: input.privacyVersion ?? '',
      analyticsConsent: input.analyticsConsent ?? false,
      status: input.status ?? 'new',
      assignedTo: input.assignedTo ?? '',
      orderAmountCents: nonNegativeInteger(input.orderAmountCents),
      partsMaterialsCostCents: nonNegativeInteger(input.partsMaterialsCostCents),
      laborCostCents: nonNegativeInteger(input.laborCostCents),
      logisticsCostCents: nonNegativeInteger(input.logisticsCostCents),
      otherCostCents: nonNegativeInteger(input.otherCostCents),
      locale: input.locale ?? 'ru',
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoNothing()
    .returning({ id: contactSubmissions.id });

  if (created) {
    await recordLeadActivity(db, {
      submissionId: created.id,
      activityType: 'lead_created',
      actor: 'system',
      toValue: input.origin,
      details: { source: deriveSource(input), externalLeadId, externalFormId: input.externalFormId ?? '' },
      createdAt: now
    });
    return { id: created.id, created: true };
  }

  if (!externalLeadId) {
    throw new Error('Failed to create CRM lead');
  }

  const [existing] = await db
    .select({ id: contactSubmissions.id })
    .from(contactSubmissions)
    .where(
      and(
        eq(contactSubmissions.origin, input.origin),
        eq(contactSubmissions.externalLeadId, externalLeadId)
      )
    );
  if (!existing) throw new Error('External lead conflict could not be resolved');
  return { id: existing.id, created: false };
}

export async function getContactSubmissions(db: Db): Promise<SubmissionRow[]> {
  return db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(200);
}

export async function getContactSubmissionsForPeriod(
  db: Db,
  input: { from: Date; to: Date; limit?: number }
): Promise<SubmissionRow[]> {
  if (
    Number.isNaN(input.from.getTime()) ||
    Number.isNaN(input.to.getTime()) ||
    input.from > input.to
  ) {
    throw new Error('Invalid submission report period');
  }
  return db
    .select()
    .from(contactSubmissions)
    .where(
      and(
        gte(contactSubmissions.createdAt, input.from),
        lte(contactSubmissions.createdAt, input.to)
      )
    )
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(Math.min(Math.max(input.limit ?? 5_001, 1), 20_000));
}

export async function getContactSubmissionsUpdatedSince(
  db: Db,
  input: { since: Date; limit?: number }
): Promise<SubmissionRow[]> {
  if (Number.isNaN(input.since.getTime())) throw new Error('Invalid reconciliation start');
  return db
    .select()
    .from(contactSubmissions)
    .where(
      or(
        gte(contactSubmissions.updatedAt, input.since),
        and(isNull(contactSubmissions.updatedAt), gte(contactSubmissions.createdAt, input.since))
      )
    )
    .orderBy(desc(contactSubmissions.updatedAt), desc(contactSubmissions.createdAt))
    .limit(Math.min(Math.max(input.limit ?? 1_000, 1), 10_000));
}

export async function getContactSubmission(db: Db, id: number): Promise<SubmissionRow | undefined> {
  const [row] = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id));
  return row;
}

export async function findPotentialDuplicateSubmissions(
  db: Db,
  input: {
    normalizedPhone?: string;
    normalizedEmail?: string;
    phone?: string;
    email?: string;
    excludeId?: number;
    limit?: number;
  }
): Promise<SubmissionRow[]> {
  const phoneNormalized = input.normalizedPhone ?? normalizePhone(input.phone ?? '');
  const emailNormalized = input.normalizedEmail ?? normalizeEmail(input.email ?? '');
  const matches = [
    ...(phoneNormalized ? [eq(contactSubmissions.phoneNormalized, phoneNormalized)] : []),
    ...(emailNormalized ? [eq(contactSubmissions.emailNormalized, emailNormalized)] : [])
  ];
  if (matches.length === 0) return [];

  const duplicate = matches.length === 1 ? matches[0] : or(...matches);
  const where = input.excludeId
    ? and(duplicate, ne(contactSubmissions.id, input.excludeId))
    : duplicate;
  return db
    .select()
    .from(contactSubmissions)
    .where(where)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(Math.min(Math.max(input.limit ?? 20, 1), 100));
}

export async function deleteContactSubmission(db: Db, id: number): Promise<void> {
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
}

export async function updateContactSubmissionPipeline(
  db: Db,
  id: number,
  input: SubmissionPipelineInput
): Promise<void> {
  const [current] = await db
    .select({
      status: contactSubmissions.status,
      assignedTo: contactSubmissions.assignedTo,
      orderAmountCents: contactSubmissions.orderAmountCents,
      lossReason: contactSubmissions.lossReason,
      adminNotes: contactSubmissions.adminNotes,
      firstContactedAt: contactSubmissions.firstContactedAt,
      qualifiedAt: contactSubmissions.qualifiedAt,
      bookedAt: contactSubmissions.bookedAt,
      completedAt: contactSubmissions.completedAt,
      lostAt: contactSubmissions.lostAt
    })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id));
  if (!current) return;

  const now = new Date();
  const orderAmountCents = nonNegativeInteger(input.orderAmountCents);
  await db
    .update(contactSubmissions)
    .set({
      status: input.status,
      assignedTo: input.assignedTo,
      orderAmountCents,
      lossReason: input.status === 'lost' ? input.lossReason : '',
      adminNotes: input.adminNotes,
      firstContactedAt:
        input.status === 'contacted' && !current.firstContactedAt ? now : current.firstContactedAt,
      qualifiedAt:
        input.status === 'qualified' && !current.qualifiedAt ? now : current.qualifiedAt,
      bookedAt: input.status === 'booked' && !current.bookedAt ? now : current.bookedAt,
      completedAt:
        input.status === 'completed' && !current.completedAt ? now : current.completedAt,
      lostAt: input.status === 'lost' && !current.lostAt ? now : current.lostAt,
      updatedAt: now
    })
    .where(eq(contactSubmissions.id, id));

  await recordLeadActivity(db, {
    submissionId: id,
    activityType: current.status === input.status ? 'pipeline_updated' : 'status_changed',
    actor: input.actor ?? 'admin',
    fromValue: current.status,
    toValue: input.status,
    details: {
      assignedTo: { from: current.assignedTo, to: input.assignedTo },
      orderAmountCents: { from: current.orderAmountCents, to: orderAmountCents },
      lossReason: { from: current.lossReason, to: input.status === 'lost' ? input.lossReason : '' },
      notesChanged: current.adminNotes !== input.adminNotes
    },
    createdAt: now
  });
}

export async function updateLeadFinancials(
  db: Db,
  id: number,
  input: LeadFinancialsInput
): Promise<void> {
  const [current] = await db
    .select({
      orderAmountCents: contactSubmissions.orderAmountCents,
      partsMaterialsCostCents: contactSubmissions.partsMaterialsCostCents,
      laborCostCents: contactSubmissions.laborCostCents,
      logisticsCostCents: contactSubmissions.logisticsCostCents,
      otherCostCents: contactSubmissions.otherCostCents
    })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id));
  if (!current) return;

  const next = {
    orderAmountCents: nonNegativeInteger(input.orderAmountCents),
    partsMaterialsCostCents: nonNegativeInteger(input.partsMaterialsCostCents),
    laborCostCents: nonNegativeInteger(input.laborCostCents),
    logisticsCostCents: nonNegativeInteger(input.logisticsCostCents),
    otherCostCents: nonNegativeInteger(input.otherCostCents)
  };
  const now = new Date();
  await db
    .update(contactSubmissions)
    .set({ ...next, updatedAt: now })
    .where(eq(contactSubmissions.id, id));
  await recordLeadActivity(db, {
    submissionId: id,
    activityType: 'financials_updated',
    actor: input.actor ?? 'admin',
    details: { from: current, to: next },
    createdAt: now
  });
}

export async function updateLeadNextAction(
  db: Db,
  id: number,
  input: LeadNextActionInput
): Promise<void> {
  const [current] = await db
    .select({
      nextActionAt: contactSubmissions.nextActionAt,
      nextActionNote: contactSubmissions.nextActionNote
    })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id));
  if (!current) return;

  const now = new Date();
  await db
    .update(contactSubmissions)
    .set({
      nextActionAt: input.nextActionAt,
      nextActionNote: input.nextActionNote,
      updatedAt: now
    })
    .where(eq(contactSubmissions.id, id));
  await recordLeadActivity(db, {
    submissionId: id,
    activityType: 'next_action_updated',
    actor: input.actor ?? 'admin',
    details: {
      from: { at: current.nextActionAt?.toISOString() ?? null, note: current.nextActionNote },
      to: { at: input.nextActionAt?.toISOString() ?? null, note: input.nextActionNote }
    },
    createdAt: now
  });
}

export function calculateSubmissionFinancials(row: Pick<
  SubmissionRow,
  | 'orderAmountCents'
  | 'partsMaterialsCostCents'
  | 'laborCostCents'
  | 'logisticsCostCents'
  | 'otherCostCents'
>): { revenueCents: number; totalCostCents: number; grossProfitCents: number } {
  const totalCostCents =
    row.partsMaterialsCostCents +
    row.laborCostCents +
    row.logisticsCostCents +
    row.otherCostCents;
  return {
    revenueCents: row.orderAmountCents,
    totalCostCents,
    grossProfitCents: row.orderAmountCents - totalCostCents
  };
}

export type LeadActivityInput = {
  submissionId: number;
  activityType: string;
  actor?: string;
  fromValue?: string;
  toValue?: string;
  details?: unknown;
  createdAt?: Date;
};

export type LeadActivityRow = typeof leadActivities.$inferSelect;

export async function recordLeadActivity(db: Db, input: LeadActivityInput): Promise<number> {
  const [created] = await db
    .insert(leadActivities)
    .values({
      submissionId: input.submissionId,
      activityType: input.activityType,
      actor: input.actor ?? 'system',
      fromValue: input.fromValue ?? '',
      toValue: input.toValue ?? '',
      detailsJson: JSON.stringify(input.details ?? {}),
      createdAt: input.createdAt ?? new Date()
    })
    .returning({ id: leadActivities.id });
  return created.id;
}

export async function getLeadActivities(db: Db, submissionId: number): Promise<LeadActivityRow[]> {
  return db
    .select()
    .from(leadActivities)
    .where(eq(leadActivities.submissionId, submissionId))
    .orderBy(desc(leadActivities.createdAt), desc(leadActivities.id));
}

// Route-facing names; the lead-prefixed exports above remain available for compatibility.
export const appendSubmissionActivity = recordLeadActivity;
export const getSubmissionActivities = getLeadActivities;
