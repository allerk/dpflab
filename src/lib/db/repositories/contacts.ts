import type { Db } from '../types';
import { contacts } from '../schema';

export type ContactsRow = {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  weekdaysOpen: string;
  weekdaysClose: string;
  saturdayOpen: string | null;
  saturdayClose: string | null;
};

export async function getContacts(db: Db): Promise<ContactsRow | null> {
  const rows = await db
    .select({
      phone: contacts.phone,
      phoneHref: contacts.phoneHref,
      whatsapp: contacts.whatsapp,
      email: contacts.email,
      address: contacts.address,
      weekdaysOpen: contacts.weekdaysOpen,
      weekdaysClose: contacts.weekdaysClose,
      saturdayOpen: contacts.saturdayOpen,
      saturdayClose: contacts.saturdayClose
    })
    .from(contacts)
    .limit(1);

  return rows[0] ?? null;
}
