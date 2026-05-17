import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import { certificates } from '../../src/lib/db/schema';
import { makeLangStr } from '../../src/lib/db/langstr';
import { getCertificates } from '../../src/lib/db/repositories/certificates';

describe('getCertificates', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('returns certificates in the requested locale ordered by sort_order', async () => {
    await db.insert(certificates).values([
      {
        title: makeLangStr({ ee: 'Garantii', ru: 'Гарантия' }),
        text: makeLangStr({ ee: 'Kõikidele töödele', ru: 'На все работы' }),
        sortOrder: 2
      },
      {
        title: makeLangStr({ ee: 'ISO 9001', ru: 'ISO 9001' }),
        text: makeLangStr({ ee: 'Kvaliteedisertifikaat', ru: 'Сертификат' }),
        sortOrder: 1
      }
    ]);

    const items = await getCertificates(db, 'ru');

    expect(items).toEqual([
      { title: 'ISO 9001', text: 'Сертификат' },
      { title: 'Гарантия', text: 'На все работы' }
    ]);
  });

  it('returns empty array when no rows exist', async () => {
    expect(await getCertificates(db, 'ru')).toEqual([]);
  });
});
