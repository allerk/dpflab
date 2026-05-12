import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { resolve } from 'path';
import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'file:./data/dpflab.db';
const client = createClient({ url });
export const db = drizzle(client, { schema });

// Runs once on module load (Node caches modules). Assumes drizzle/ folder is
// present in process.cwd() — true both locally and on the Node server.
await migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle') });
