import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { contacts } from '../../src/lib/db/schema';
import { getContacts } from '../../src/lib/db/repositories/contacts';

const SAMPLE = {
  phone: '+372 5850 7200',
  phoneHref: 'tel:+37258507200',
  whatsapp: 'https://wa.me/37258507200',
  email: 'info@dpflab.ee',
  address: 'Tallinn, Estonia',
  weekdaysOpen: '09:00',
  weekdaysClose: '18:00',
  saturdayOpen: '10:00',
  saturdayClose: '15:00'
};

describe('getContacts', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns the single contacts row', async () => {
    await db.insert(contacts).values(SAMPLE);

    const result = await getContacts(db);

    expect(result).toMatchObject(SAMPLE);
  });

  it('returns null when no contacts row exists', async () => {
    expect(await getContacts(db)).toBeNull();
  });

  it('returns null saturday hours when closed', async () => {
    await db.insert(contacts).values({ ...SAMPLE, saturdayOpen: null, saturdayClose: null });

    const result = await getContacts(db);

    expect(result?.saturdayOpen).toBeNull();
    expect(result?.saturdayClose).toBeNull();
  });
});
