import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { resolve } from 'path';
import * as schema from '../../src/lib/db/schema';

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

export async function createTestDb(): Promise<TestDb> {
  const client = createClient({ url: ':memory:' });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle') });
  return db;
}
