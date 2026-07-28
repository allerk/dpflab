import { desc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { contactSubmissions } from '../schema';

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
  landingPage?: string;
  referrer?: string;
  privacyVersion: string;
  analyticsConsent?: boolean;
  locale: string;
};

export type SubmissionRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  comment: string;
  clientType: string;
  serviceType: string;
  filterState: string;
  vehicle: string;
  symptoms: string;
  urgency: string;
  preferredContact: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  utmId: string;
  campaignId: string;
  adsetId: string;
  adId: string;
  fbclid: string;
  fbp: string;
  fbc: string;
  landingPage: string;
  referrer: string;
  privacyVersion: string;
  analyticsConsent: boolean;
  status: SubmissionStatus;
  assignedTo: string;
  orderAmountCents: number;
  lossReason: string;
  adminNotes: string;
  firstContactedAt: Date | null;
  qualifiedAt: Date | null;
  bookedAt: Date | null;
  completedAt: Date | null;
  lostAt: Date | null;
  updatedAt: Date | null;
  locale: string;
  createdAt: Date;
};

export const SUBMISSION_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'booked',
  'completed',
  'lost'
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type SubmissionPipelineInput = {
  status: SubmissionStatus;
  assignedTo: string;
  orderAmountCents: number;
  lossReason: string;
  adminNotes: string;
};

export async function createContactSubmission(db: Db, input: SubmissionInput): Promise<number> {
  const [created] = await db.insert(contactSubmissions).values({
    name: input.name,
    phone: input.phone,
    email: input.email,
    comment: input.comment ?? '',
    clientType: input.clientType,
    serviceType: input.serviceType,
    filterState: input.filterState,
    vehicle: input.vehicle,
    symptoms: input.symptoms ?? '',
    urgency: input.urgency,
    preferredContact: input.preferredContact,
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
    landingPage: input.landingPage ?? '',
    referrer: input.referrer ?? '',
    privacyVersion: input.privacyVersion,
    analyticsConsent: input.analyticsConsent ?? false,
    locale: input.locale,
    createdAt: new Date()
  }).returning({ id: contactSubmissions.id });

  return created.id;
}

export async function getContactSubmissions(db: Db): Promise<SubmissionRow[]> {
  return db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      phone: contactSubmissions.phone,
      email: contactSubmissions.email,
      comment: contactSubmissions.comment,
      clientType: contactSubmissions.clientType,
      serviceType: contactSubmissions.serviceType,
      filterState: contactSubmissions.filterState,
      vehicle: contactSubmissions.vehicle,
      symptoms: contactSubmissions.symptoms,
      urgency: contactSubmissions.urgency,
      preferredContact: contactSubmissions.preferredContact,
      utmSource: contactSubmissions.utmSource,
      utmMedium: contactSubmissions.utmMedium,
      utmCampaign: contactSubmissions.utmCampaign,
      utmContent: contactSubmissions.utmContent,
      utmTerm: contactSubmissions.utmTerm,
      utmId: contactSubmissions.utmId,
      campaignId: contactSubmissions.campaignId,
      adsetId: contactSubmissions.adsetId,
      adId: contactSubmissions.adId,
      fbclid: contactSubmissions.fbclid,
      fbp: contactSubmissions.fbp,
      fbc: contactSubmissions.fbc,
      landingPage: contactSubmissions.landingPage,
      referrer: contactSubmissions.referrer,
      privacyVersion: contactSubmissions.privacyVersion,
      analyticsConsent: contactSubmissions.analyticsConsent,
      status: contactSubmissions.status,
      assignedTo: contactSubmissions.assignedTo,
      orderAmountCents: contactSubmissions.orderAmountCents,
      lossReason: contactSubmissions.lossReason,
      adminNotes: contactSubmissions.adminNotes,
      firstContactedAt: contactSubmissions.firstContactedAt,
      qualifiedAt: contactSubmissions.qualifiedAt,
      bookedAt: contactSubmissions.bookedAt,
      completedAt: contactSubmissions.completedAt,
      lostAt: contactSubmissions.lostAt,
      updatedAt: contactSubmissions.updatedAt,
      locale: contactSubmissions.locale,
      createdAt: contactSubmissions.createdAt
    })
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(200);
}

export async function getContactSubmission(db: Db, id: number): Promise<SubmissionRow | undefined> {
  const [row] = await db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      phone: contactSubmissions.phone,
      email: contactSubmissions.email,
      comment: contactSubmissions.comment,
      clientType: contactSubmissions.clientType,
      serviceType: contactSubmissions.serviceType,
      filterState: contactSubmissions.filterState,
      vehicle: contactSubmissions.vehicle,
      symptoms: contactSubmissions.symptoms,
      urgency: contactSubmissions.urgency,
      preferredContact: contactSubmissions.preferredContact,
      utmSource: contactSubmissions.utmSource,
      utmMedium: contactSubmissions.utmMedium,
      utmCampaign: contactSubmissions.utmCampaign,
      utmContent: contactSubmissions.utmContent,
      utmTerm: contactSubmissions.utmTerm,
      utmId: contactSubmissions.utmId,
      campaignId: contactSubmissions.campaignId,
      adsetId: contactSubmissions.adsetId,
      adId: contactSubmissions.adId,
      fbclid: contactSubmissions.fbclid,
      fbp: contactSubmissions.fbp,
      fbc: contactSubmissions.fbc,
      landingPage: contactSubmissions.landingPage,
      referrer: contactSubmissions.referrer,
      privacyVersion: contactSubmissions.privacyVersion,
      analyticsConsent: contactSubmissions.analyticsConsent,
      status: contactSubmissions.status,
      assignedTo: contactSubmissions.assignedTo,
      orderAmountCents: contactSubmissions.orderAmountCents,
      lossReason: contactSubmissions.lossReason,
      adminNotes: contactSubmissions.adminNotes,
      firstContactedAt: contactSubmissions.firstContactedAt,
      qualifiedAt: contactSubmissions.qualifiedAt,
      bookedAt: contactSubmissions.bookedAt,
      completedAt: contactSubmissions.completedAt,
      lostAt: contactSubmissions.lostAt,
      updatedAt: contactSubmissions.updatedAt,
      locale: contactSubmissions.locale,
      createdAt: contactSubmissions.createdAt
    })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id));

  return row;
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
  const stageRank: Record<SubmissionStatus, number> = {
    new: 0,
    contacted: 1,
    qualified: 2,
    booked: 3,
    completed: 4,
    lost: -1
  };
  const rank = stageRank[input.status];
  await db
    .update(contactSubmissions)
    .set({
      status: input.status,
      assignedTo: input.assignedTo,
      orderAmountCents: Math.max(0, Math.round(input.orderAmountCents)),
      lossReason: input.status === 'lost' ? input.lossReason : '',
      adminNotes: input.adminNotes,
      firstContactedAt:
        rank >= 1 && !current.firstContactedAt ? now : current.firstContactedAt,
      qualifiedAt:
        rank >= 2 && !current.qualifiedAt ? now : current.qualifiedAt,
      bookedAt: rank >= 3 && !current.bookedAt ? now : current.bookedAt,
      completedAt:
        rank >= 4 && !current.completedAt ? now : current.completedAt,
      lostAt: input.status === 'lost' && !current.lostAt ? now : current.lostAt,
      updatedAt: now
    })
    .where(eq(contactSubmissions.id, id));
}
