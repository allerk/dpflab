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
  fbclid?: string;
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
  fbclid: string;
  landingPage: string;
  referrer: string;
  privacyVersion: string;
  analyticsConsent: boolean;
  locale: string;
  createdAt: Date;
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
    fbclid: input.fbclid ?? '',
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
      fbclid: contactSubmissions.fbclid,
      landingPage: contactSubmissions.landingPage,
      referrer: contactSubmissions.referrer,
      privacyVersion: contactSubmissions.privacyVersion,
      analyticsConsent: contactSubmissions.analyticsConsent,
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
      fbclid: contactSubmissions.fbclid,
      landingPage: contactSubmissions.landingPage,
      referrer: contactSubmissions.referrer,
      privacyVersion: contactSubmissions.privacyVersion,
      analyticsConsent: contactSubmissions.analyticsConsent,
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
