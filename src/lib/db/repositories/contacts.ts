import { eq } from 'drizzle-orm';
import type { Db } from '../types';
import { contacts } from '../schema';

export type ContactsRow = {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  hoursWeek: string;
  hoursSat: string;
};

export async function getContacts(db: Db, locale: string): Promise<ContactsRow | null> {
  const rows = await db
    .select({
      phone: contacts.phone,
      phoneHref: contacts.phoneHref,
      whatsapp: contacts.whatsapp,
      email: contacts.email,
      address: contacts.address,
      hoursWeek: contacts.hoursWeek,
      hoursSat: contacts.hoursSat
    })
    .from(contacts)
    .where(eq(contacts.locale, locale))
    .limit(1);

  return rows[0] ?? null;
}
