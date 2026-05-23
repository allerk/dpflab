---
name: database
description: Work with the SQLite database via Drizzle ORM — schemas, migrations, repositories, and seeding. Use when adding tables, columns, or repository functions; writing queries; generating or applying migrations; or seeding content. Triggers on mentions of drizzle, schema.ts, migrations, repositories, libsql, or data/dpflab.db.
---

# Database

SQLite (via `@libsql/client`) + Drizzle ORM. Migrations run automatically on server start.

## Layout

- `src/lib/db/schema.ts` — single source of truth for table shape. Add tables here first.
- `src/lib/db/repositories/<table>.ts` — one file per table. Every function takes `db: Db` as its first arg so tests can inject an in-memory DB.
- `src/lib/db/index.ts` — production DB client + auto-migrate on import.
- `src/lib/db/seed.ts` — idempotent seeding for content tables.
- `src/lib/db/langstr.ts` — `makeLangStr({et,ru})` / `getLang(str, locale)` for translatable text columns (stored as a single `text` column, not multi-row).
- `drizzle/` — generated migrations. Must ship to production alongside `build/`.

## Commands

```bash
npm run db:generate   # after editing schema.ts → writes a new migration
npm run db:migrate    # apply to data/dpflab.db
npm run db:seed       # re-run idempotent seed
```

## Adding a feature

1. Edit `schema.ts` — add table or column.
2. `npm run db:generate` — review the generated SQL in `drizzle/`.
3. Create or extend `src/lib/db/repositories/<table>.ts`. Every function signature: `(db: Db, ...args) => Promise<…>`.
4. Translatable text: store `makeLangStr({et,ru})` in a single `text` column; resolve at read time with `getLang(value, locale)`.
5. Wire into `src/routes/+page.server.ts` (or admin route) — query in parallel via `Promise.all`, pass to component as a typed prop.
6. Add or extend tests in `tests/db/<table>.repository.test.ts` (see [[tdd]]).
7. If the table holds editable content, update `seed.ts` so a fresh `db:seed` populates it.

## Conventions

- Re-sequence `sortOrder` after deletes (see `repositories/faq.ts:42` for the pattern).
- Reorder via swap, not full re-index, when only moving one row.
- Never call `process.cwd()` in repositories — keep them pure. The `drizzle/` path resolution lives in `index.ts` only.
- Don't import `db` from `index.ts` inside repository files — accept it as a parameter.
