import type { Db } from '../types';
import { contactSubmissions } from '../schema';

export type SubmissionInput = {
  name: string;
  phone: string;
  comment?: string;
  locale: string;
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
