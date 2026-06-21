import { defineConfig } from 'drizzle-kit';

// Migrations are generated here (SQLite dialect) and applied to Cloudflare D1
// out-of-band via `wrangler d1 migrations apply` — see package.json scripts.
// `drizzle-kit generate` does not need a DB connection.
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite'
});
