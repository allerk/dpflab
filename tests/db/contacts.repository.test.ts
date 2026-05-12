import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contacts } from '../../src/lib/db/schema';
import { getContacts } from '../../src/lib/db/repositories/contacts';

const RU_CONTACTS = {
  locale: 'ru',
  phone: '+372 5850 7200',
  phoneHref: 'tel:+37258507200',
  whatsapp: 'https://wa.me/37258507200',
  email: 'info@dpflab.ee',
  address: 'Tallinn, Estonia',
  hoursWeek: 'Пн – Пт: 9:00 – 18:00',
  hoursSat: 'Сб: 10:00 – 15:00'
};

describe('getContacts', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns the contacts row for the requested locale', async () => {
    await db.insert(contacts).values([
      RU_CONTACTS,
      { ...RU_CONTACTS, locale: 'ee', address: 'Tallinn, Eesti', hoursWeek: 'E – R: 9:00 – 18:00', hoursSat: 'L: 10:00 – 15:00' }
    ]);

    const result = await getContacts(db, 'ru');

    expect(result).toMatchObject({
      phone: '+372 5850 7200',
      email: 'info@dpflab.ee',
      address: 'Tallinn, Estonia',
      hoursWeek: 'Пн – Пт: 9:00 – 18:00'
    });
  });

  it('returns null when no contacts for locale', async () => {
    const result = await getContacts(db, 'ru');
    expect(result).toBeNull();
  });

  it('returns the correct locale row', async () => {
    await db.insert(contacts).values([
      RU_CONTACTS,
      { ...RU_CONTACTS, locale: 'ee', address: 'Tallinn, Eesti', hoursWeek: 'E – R: 9:00 – 18:00', hoursSat: 'L: 10:00 – 15:00' }
    ]);

    const result = await getContacts(db, 'ee');

    expect(result?.address).toBe('Tallinn, Eesti');
    expect(result?.hoursWeek).toBe('E – R: 9:00 – 18:00');
  });
});
