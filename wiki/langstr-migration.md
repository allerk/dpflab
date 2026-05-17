# LangStr Migration Spec

Migrate content tables from **one row per item per locale** to **one row per item with embedded JSON translations**.

---

## Motivation

Current model requires inserting N rows per content item (one per locale). Adding a third language means inserting new rows across every table. The LangStr model embeds all translations in a single row — adding a language is a seed update only, no schema change.

---

## LangStr type

A `LangStr` is a JSON string stored in a SQLite `TEXT` column:

```json
{ "ee": "Kui kaua võtab DPF puhastus aega?", "ru": "Сколько времени занимает очистка DPF?" }
```

**Helper module** — `src/lib/db/langstr.ts`:

```ts
export type LangStr = Record<string, string>;

// Serialize for DB insertion
export function makeLangStr(values: LangStr): string

// Deserialize + extract for a locale. Falls back to 'ee', then first available key.
export function getLang(raw: string, locale: string): string
```

Fallback chain: `locale` → `'ee'` → first key in the object. This ensures the site never shows an empty string even if a new locale key is missing from some rows.

---

## Schema changes

### Tables with LangStr columns

| Table | LangStr columns | Plain columns (unchanged) |
|---|---|---|
| `faq` | `question`, `answer` | `id`, `sort_order` |
| `reviews` | `text` | `id`, `stars`, `author`, `sort_order` |
| `pricing` | `title`, `cta` | `id`, `icon`, `price`, `sort_order` |
| `certificates` | `title`, `text` | `id`, `sort_order` |

`price` in pricing is plain text — a single value shown in all locales (e.g. `"150€"`).

### `contacts` table

No LangStr. **Single row**, all plain text, no `locale` column. Same contact info displayed regardless of active locale.

#### Business hours

Hours are stored as structured time columns, **not as pre-formatted strings**. Day labels ("Mon–Fri", "Пн–Пт", "E–R") are generated at render time from the locale using `Intl.DateTimeFormat` — the DB never stores day names.

Times are stored **as-is (wall clock, Europe/Tallinn)** — not UTC. Business hours are a recurring daily schedule, not a point in time. UTC conversion would be meaningless here.

```
contacts
┌────┬───────────────┬──────────────────┬─────────────────────────┬───────────────┬──────────────────────┬───────────────────┬──────────────────┬─────────────────┬──────────────────┐
│ id │ phone         │ phone_href       │ whatsapp                │ email         │ address              │ weekdays_open     │ weekdays_close   │ saturday_open   │ saturday_close   │
├────┼───────────────┼──────────────────┼─────────────────────────┼───────────────┼──────────────────────┼───────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ 1  │ +372 5850 7200│ tel:+37258507200 │ https://wa.me/...       │ info@dpf...   │ Tallinn, Estonia     │ 09:00             │ 18:00            │ 10:00           │ 15:00            │
└────┴───────────────┴──────────────────┴─────────────────────────┴───────────────┴──────────────────────┴───────────────────┴──────────────────┴─────────────────┴──────────────────┘
```

`saturday_open` and `saturday_close` are **nullable** — set to `NULL` when closed on Saturdays. `sunday_open` / `sunday_close` are not stored (assumed always closed); add them if needed without a model change elsewhere.

**Rendering example** (in `ContactForm.svelte`):

```ts
const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
// generates "Mon", "Пн", "E" etc. from a known weekday date
```

### `contact_submissions` table

**Unchanged.** Keeps its own `locale TEXT` column — records which language the user was on when they submitted. Never touched by reseed. See [contact_submissions behaviour](#contact_submissions-behaviour).

---

## Migration

Drizzle Kit generates a new SQL migration from the schema diff. Because SQLite cannot `ALTER COLUMN`, the migration will recreate affected tables. Content data is re-seeded after migration — no user data is lost (only `contact_submissions` holds user data and it is not affected).

```bash
npm run db:generate   # generates drizzle/000X_*.sql
npm run db:migrate    # applies to data/dpflab.db
npm run db:seed       # repopulates content tables
```

---

## Repository changes

External interface is **identical** — components and `+page.server.ts` do not change.

```ts
// before and after: same signature, same return type
getFaqItems(db, 'ru')  →  { question: string, answer: string }[]
```

Internally, repositories drop the `WHERE locale =` filter and instead call `getLang(row.question, locale)` on each row after fetching all rows.

### Updated repositories

- `faq.ts` — `getFaqItems(db, locale)` — selects all, maps with `getLang`
- `reviews.ts` — `getReviews(db, locale)` — selects all, maps with `getLang`
- `pricing.ts` — `getPricingItems(db, locale)` — selects all, maps `title`/`cta` with `getLang`; `price` and `icon` passed through as-is
- `certificates.ts` — `getCertificates(db, locale)` — selects all, maps with `getLang`
- `contacts.ts` — `getContacts(db)` — no locale param; returns single row or null

### `getContacts` signature change

```ts
// before
getContacts(db, locale)

// after
getContacts(db)   // no locale — single row, no filtering needed
```

This is the only breaking change in the public API. `+page.server.ts` call site updated accordingly.

---

## Seed changes

One row per item, both locales embedded:

```ts
await db.insert(faq).values([
  {
    question: makeLangStr({ ee: 'Kui kaua võtab...', ru: 'Сколько времени...' }),
    answer:   makeLangStr({ ee: 'Standardne puhastus...', ru: 'Стандартная очистка...' }),
    sortOrder: 1
  },
  // ...
]);

// contacts — single plain row, wall-clock times (Europe/Tallinn), no UTC conversion
await db.insert(contacts).values({
  phone:          '+372 5850 7200',
  phoneHref:      'tel:+37258507200',
  whatsapp:       'https://wa.me/37258507200',
  email:          'info@dpflab.ee',
  address:        'Tallinn, Estonia',
  weekdaysOpen:   '09:00',
  weekdaysClose:  '18:00',
  saturdayOpen:   '10:00',   // NULL if closed
  saturdayClose:  '15:00'
});
```

Seed is idempotent — truncates content tables before inserting.

---

## Test changes (TDD)

Tests updated before repositories. Key new cases:

- **correct locale returned** — insert row with `makeLangStr`, assert `getLang` returns the right string
- **fallback to `ee`** when requested locale key is missing from the JSON
- **fallback to first key** when `ee` is also missing
- **`getContacts` with no locale param** — returns the single row
- **LangStr unit tests** — `getLang` and `makeLangStr` tested independently in `tests/db/langstr.test.ts`

---

## contact_submissions behaviour

Write-only from the landing page. Never read by the page load function.

**Write path:**
1. User submits contact form
2. `+page.server.ts` `actions.default` validates `name` + `phone` server-side
3. `createContactSubmission(db, { name, phone, comment, locale })` inserts one row
4. `locale` records the language the user was viewing — used by future CRM to know whether to contact the lead in Estonian or Russian
5. `created_at` is a Unix timestamp set at insertion time

**Properties:**
- Never cleared by `db:seed` — real user data
- No update or delete operations — append-only
- Future CRM feature: admin reads this table, filters by locale, marks leads as contacted

---

## Adding a new locale (post-migration)

1. Add locale tag to `project.inlang/settings.json` → `languageTags`
2. Create `messages/{tag}.json` (Paraglide static copy)
3. Add entry to `LANGUAGES` in `Header.svelte`
4. Add the new key to every `makeLangStr` call in `seed.ts`
5. Run `npm run db:seed`

No schema change. No migration.
