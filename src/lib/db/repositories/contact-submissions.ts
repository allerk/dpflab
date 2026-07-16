import { desc, eq } from 'drizzle-orm';
import type { Db } from '../types';
import { contactSubmissions } from '../schema';

export type SubmissionInput = {
  name: string;
  phone: string;
  email: string;
  comment?: string;
  locale: string;
};

export type SubmissionRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  comment: string;
  locale: string;
  createdAt: Date;
};

export async function createContactSubmission(db: Db, input: SubmissionInput): Promise<number> {
  const [created] = await db.insert(contactSubmissions).values({
    name: input.name,
    phone: input.phone,
    email: input.email,
    comment: input.comment ?? '',
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
