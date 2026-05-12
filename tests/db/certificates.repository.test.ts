import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { certificates } from '../../src/lib/db/schema';
import { getCertificates } from '../../src/lib/db/repositories/certificates';

describe('getCertificates', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns certificates for the requested locale ordered by sort_order', async () => {
    await db.insert(certificates).values([
      { locale: 'ru', title: 'Гарантия', text: 'На все работы', sortOrder: 2 },
      { locale: 'ru', title: 'ISO 9001', text: 'Сертификат', sortOrder: 1 },
      { locale: 'ee', title: 'ISO 9001', text: 'Kvaliteedisertifikaat', sortOrder: 1 }
    ]);

    const items = await getCertificates(db, 'ru');

    expect(items).toEqual([
      { title: 'ISO 9001', text: 'Сертификат' },
      { title: 'Гарантия', text: 'На все работы' }
    ]);
  });

  it('returns empty array when no certificates for locale', async () => {
    const items = await getCertificates(db, 'ru');
    expect(items).toEqual([]);
  });

  it('excludes certificates from other locales', async () => {
    await db.insert(certificates).values([{ locale: 'ee', title: 'T', text: 'T', sortOrder: 1 }]);
    const items = await getCertificates(db, 'ru');
    expect(items).toEqual([]);
  });
});
