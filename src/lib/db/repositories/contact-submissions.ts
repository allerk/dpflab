import { desc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { contactSubmissions } from '../schema';

export type SubmissionInput = {
  name: string;
  phone: string;
  comment?: string;
  locale: string;
};

export type SubmissionRow = {
  id: number;
  name: string;
  phone: string;
  comment: string;
  locale: string;
  createdAt: Date;
};

export async function createContactSubmission(db: Db, input: SubmissionInput): Promise<void> {
  await db.insert(contactSubmissions).values({
    name: input.name,
    phone: input.phone,
    comment: input.comment ?? '',
    locale: input.locale,
    createdAt: new Date()
  });
}

export async function getContactSubmissions(db: Db): Promise<SubmissionRow[]> {
  return db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      phone: contactSubmissions.phone,
      comment: contactSubmissions.comment,
      locale: contactSubmissions.locale,
      createdAt: contactSubmissions.createdAt
    })
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(200);
}

export async function deleteContactSubmission(db: Db, id: number): Promise<void> {
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
}
