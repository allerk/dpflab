# Translation Strategy

The site uses two separate layers for i18n. Each layer owns a distinct category of content.

---

## Layer 1 — Paraglide JS (UI chrome)

**Owns:** static copy that only developers change — nav labels, button text, section headings, form field labels, validation messages, footer text.

**Source of truth:** `messages/ru.json` and `messages/et.json`. Flat key/value JSON.

**How it works:**

```
messages/ru.json  ──┐
                    ├──► paraglide-js compile ──► src/lib/paraglide/  (gitignored, generated)
messages/et.json  ──┘
```

Components import named functions and call them — the function returns the string for the currently active locale:

```ts
import { nav_home, hero_subtitle } from '$lib/paraglide/messages';

nav_home()       // → "Главная"  (ru)  |  "Avaleht"  (et)
hero_subtitle()  // → "Вернём мощность..."  |  "Taastame mootori..."
```

**Locale detection flow (server-side):**

```
Request URL
    │
    ▼
hooks.server.ts → paraglideMiddleware
    │  reads /et/* → locale = 'et'
    │  reads /*    → locale = 'ru'
    │
    ├── sets event.locals.locale
    └── injects %lang% / %dir% into app.html

hooks.ts → reroute
    │  /et/... → /  (so SvelteKit routes to the single +page.svelte)
    └── /    → /
```

**To change UI copy:** edit `messages/ru.json` or `messages/et.json`. Paraglide picks up changes on next build/dev-server restart.

---

## Layer 2 — SQLite + Drizzle (business content)

**Owns:** editable content that an admin should be able to change without a deployment — FAQ items, reviews, pricing cards, certificates, contact details.

**Source of truth:** `data/dpflab.db` (SQLite file, gitignored).

### Data model — LangStr

Translatable fields are stored as a single JSON object per row keyed by locale (a `LangStr`). There is **one row per logical item** — adding a new locale is a seed update, not a schema change.

```
faq
┌────┬───────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────┬────────────┐
│ id │ question (LangStr)                                                        │ answer (LangStr)                                                      │ sort_order │
├────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────┼────────────┤
│ 1  │ {"et":"Kui kaua võtab...","ru":"Сколько времени..."}                      │ {"et":"Standardne puhastus...","ru":"Стандартная очистка..."}         │     1      │
│ 2  │ {"et":"Kas teenus sobib...","ru":"Подходит ли услуга..."}                 │ {"et":"Jah, töötame...","ru":"Да, мы работаем..."}                    │     2      │
└────┴───────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────┴────────────┘
```

**`src/lib/db/langstr.ts`** provides the helpers:

```ts
export type LangStr = Record<string, string>;

makeLangStr({ et: '...', ru: '...' })   // → JSON string for DB insert
getLang(rawJson, locale)                // → string for active locale
```

`getLang` falls back: `locale` → `'et'` → first key in the object. This ensures the site never renders an empty string even if a new locale's key is missing from some rows.

### Tables

| Table | LangStr fields | Plain fields | Notes |
|---|---|---|---|
| `faq` | question, answer | sort_order | ordered by sort_order |
| `reviews` | text | stars, author, sort_order | author is shared (no transliteration) |
| `pricing` | title, cta | icon, price, sort_order | price is one value shown in every locale |
| `certificates` | title, text | sort_order | |
| `contacts` | *(none)* | phone, phone_href, whatsapp, email, address, weekdays_open, weekdays_close, saturday_open, saturday_close | single row; see "Contacts" below |
| `contact_submissions` | *(none)* | name, phone, comment, locale, created_at | write-only; the `locale` column records the user's active locale at submit time |

### Contacts and business hours

The contacts table is a **single row** of plain text — same contact info displayed regardless of active locale. Business hours are stored as structured wall-clock times in Europe/Tallinn (not UTC — they're a recurring daily schedule, not a point in time):

```
contacts
┌────┬────────────────┬─────────────────┬─────────────────────┬────────────────┬──────────────────┬────────────────┬─────────────────┬───────────────┬────────────────┐
│ id │ phone          │ phone_href      │ whatsapp            │ email          │ address          │ weekdays_open  │ weekdays_close  │ saturday_open │ saturday_close │
├────┼────────────────┼─────────────────┼─────────────────────┼────────────────┼──────────────────┼────────────────┼─────────────────┼───────────────┼────────────────┤
│ 1  │ +372 5850 7200 │ tel:+37258507200│ https://wa.me/...   │ info@dpflab.ee │ Tallinn, Estonia │ 09:00          │ 18:00           │ 10:00         │ 15:00          │
└────┴────────────────┴─────────────────┴─────────────────────┴────────────────┴──────────────────┴────────────────┴─────────────────┴───────────────┴────────────────┘
```

`saturday_open` and `saturday_close` are nullable — set to `NULL` when closed; `ContactForm.svelte` hides the Saturday line in that case. Sunday is not modelled (assumed always closed).

**Weekday labels are rendered at request time** from the active locale via `Intl.DateTimeFormat`, never stored in the DB:

```ts
// in ContactForm.svelte
const date = new Date(Date.UTC(2024, 0, 1));   // Monday
new Intl.DateTimeFormat('et', { weekday: 'short' }).format(date);  // → "E"
new Intl.DateTimeFormat('ru', { weekday: 'short' }).format(date);  // → "пн"  (capitalised before display)
```

Paraglide locale tags are BCP-47 (`'et'`, not `'ee'`), so the active locale is fed straight into `Intl.DateTimeFormat` with no mapping.

### Data flow at request time

```
Browser GET /et
    │
    ▼
hooks.server.ts → event.locals.locale = 'et'
    │
    ▼
+page.server.ts → load()
    │  locale = event.locals.locale  ('et')
    │
    ├── getFaqItems(db, 'et')       ─┐
    ├── getReviews(db, 'et')         │  Promise.all — parallel queries
    ├── getPricingItems(db, 'et')    │  each repository fetches all rows
    ├── getCertificates(db, 'et')   ─┘  and unwraps LangStr via getLang
    └── getContacts(db)                 (no locale param — single row)
    │
    ▼
+page.svelte → passes typed arrays as props to each section component
    │
    ├── <Pricing items={data.pricingItems} />
    ├── <Reviews items={data.reviewItems} />
    ├── <FAQ items={data.faqItems} />
    ├── <Certificates items={data.certificateItems} />
    └── <ContactForm contactsRow={data.contactsRow} locale={data.locale} />
```

`+page.server.ts` also returns `locale` so `ContactForm` can format weekday labels.

### Repository pattern

Each table has a dedicated repository in `src/lib/db/repositories/`. Repositories accept the `db` instance as a parameter (not imported as a singleton) so they are trivially testable with an in-memory DB. They `SELECT *` (no `WHERE locale = ?`) and unwrap each LangStr field with `getLang(row.field, locale)` in the mapping step.

```ts
// src/lib/db/repositories/faq.ts
export async function getFaqItems(db: Db, locale: string): Promise<FaqItem[]>

// tests/db/faq.repository.test.ts
const db = await createTestDb();  // in-memory SQLite
await db.insert(faq).values([
  { question: makeLangStr({ et: '...', ru: '...' }), answer: makeLangStr({ et: '...', ru: '...' }), sortOrder: 1 }
]);
const items = await getFaqItems(db, 'ru');
```

`getContacts(db)` takes no locale — there's only one row.

### contact_submissions behaviour

Write-only from the landing page. Never read by the page load function.

1. User submits the contact form.
2. `+page.server.ts` `actions.default` validates name + phone server-side.
3. `createContactSubmission(db, { name, phone, comment, locale })` inserts one row.
4. `locale` records the language the user was viewing — used by future CRM to know whether to contact the lead in Estonian or Russian.

It is never cleared by `db:seed` (real user data) and has no update/delete path — append-only.

---

## Which layer for new content?

| Content type | Use |
|---|---|
| Button label, nav item, form placeholder, heading | Paraglide (`messages/*.json`) |
| Editable copy — prices, FAQ answers, review text | DB LangStr (`src/lib/db/seed.ts` + SQLite) |
| Shared across all locales (e.g. a logo URL, contact phone) | DB plain column, or Paraglide if it's truly static |

---

## Adding a new locale

1. Add the locale tag to `project.inlang/settings.json` → `languageTags`.
2. Create `messages/{tag}.json` with all keys translated.
3. Add an entry to the `LANGUAGES` map in `Header.svelte`.
4. Add the new key to every `makeLangStr(...)` call in `src/lib/db/seed.ts`.
5. Run `npm run db:seed`.

No schema change. No migration.
