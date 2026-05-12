# Translation Strategy

The site uses two separate layers for i18n. Each layer owns a distinct category of content.

---

## Layer 1 — Paraglide JS (UI chrome)

**Owns:** static copy that only developers change — nav labels, button text, section headings, form field labels, validation messages, footer text.

**Source of truth:** `messages/ru.json` and `messages/ee.json`. Flat key/value JSON.

**How it works:**

```
messages/ru.json  ──┐
                    ├──► paraglide-js compile ──► src/lib/paraglide/  (gitignored, generated)
messages/ee.json  ──┘
```

Components import named functions and call them — the function returns the string for the currently active locale:

```ts
import { nav_home, hero_subtitle } from '$lib/paraglide/messages';

nav_home()       // → "Главная"  (ru)  |  "Avaleht"  (ee)
hero_subtitle()  // → "Вернём мощность..."  |  "Taastame mootori..."
```

**Locale detection flow (server-side):**

```
Request URL
    │
    ▼
hooks.server.ts → paraglideMiddleware
    │  reads /ee/* → locale = 'ee'
    │  reads /*    → locale = 'ru'
    │
    ├── sets event.locals.locale
    └── injects %lang% / %dir% into app.html

hooks.ts → reroute
    │  /ee/... → /  (so SvelteKit routes to the single +page.svelte)
    └── /    → /
```

**To change UI copy:** edit `messages/ru.json` or `messages/ee.json`. Paraglide picks up changes on next build/dev-server restart.

---

## Layer 2 — SQLite + Drizzle (business content)

**Owns:** editable content that an admin should be able to change without a deployment — FAQ items, reviews, pricing cards, certificates, contact details.

**Source of truth:** `data/dpflab.db` (SQLite file, gitignored).

### Data model

Each content table has a `locale` column (`'ru'` or `'ee'`) and a `sort_order` column. There is **one row per locale per logical item** — not a shared base row with a translations join.

```
faq
┌────┬────────┬──────────────────────────┬────────────────────────┬────────────┐
│ id │ locale │ question                 │ answer                 │ sort_order │
├────┼────────┼──────────────────────────┼────────────────────────┼────────────┤
│ 1  │ ru     │ Сколько времени...       │ Стандартная очистка... │     1      │
│ 2  │ ru     │ Подходит ли услуга...    │ Да, мы работаем...     │     2      │
│ 6  │ ee     │ Kui kaua võtab...        │ Standardne puhastus... │     1      │
│ 7  │ ee     │ Kas teenus sobib...      │ Jah, töötame...        │     2      │
└────┴────────┴──────────────────────────┴────────────────────────┴────────────┘
```

**Why one row per locale instead of a base + translations table?**

A normalised design (`faq_base` + `faq_translations`) would avoid repeating `sort_order` and any shared fields, but it requires a JOIN on every read and extra complexity when inserting/editing. For content this small and this rarely changing, the flat model is simpler and faster to query. Adding a third locale (e.g. `fi`) is just `INSERT` — no schema change.

The one genuine duplication is in `contacts`: `phone`, `phone_href`, `whatsapp`, and `email` are the same in both locale rows. That's an acceptable trade-off — it avoids splitting a single-row table.

### Tables

| Table | Locale-specific fields | Notes |
|---|---|---|
| `faq` | question, answer | ordered by sort_order |
| `reviews` | stars, text, author | ordered by sort_order |
| `pricing` | icon, title, price, cta | icon is the Icon.svelte name string |
| `certificates` | title, text | ordered by sort_order |
| `contacts` | phone, phone_href, whatsapp, email, address, hours_week, hours_sat | one row per locale |
| `contact_submissions` | name, phone, comment, locale, created_at | write-only, no locale filter on read |

### Data flow at request time

```
Browser GET /ee
    │
    ▼
hooks.server.ts → event.locals.locale = 'ee'
    │
    ▼
+page.server.ts → load()
    │  locale = event.locals.locale  ('ee')
    │
    ├── getFaqItems(db, 'ee')       ─┐
    ├── getReviews(db, 'ee')         │  Promise.all — parallel queries
    ├── getPricingItems(db, 'ee')    │
    ├── getCertificates(db, 'ee')   ─┘
    └── getContacts(db, 'ee')
    │
    ▼
+page.svelte → passes typed arrays as props to each section component
    │
    ├── <Pricing items={data.pricingItems} />
    ├── <Reviews items={data.reviewItems} />
    ├── <FAQ items={data.faqItems} />
    ├── <Certificates items={data.certificateItems} />
    └── <ContactForm contactsRow={data.contactsRow} />
```

### Repository pattern

Each table has a dedicated repository in `src/lib/db/repositories/`. Repositories accept the `db` instance as a parameter (not imported as a singleton) so they are trivially testable with an in-memory DB:

```ts
// src/lib/db/repositories/faq.ts
export async function getFaqItems(db: Db, locale: string): Promise<FaqItem[]>

// tests/db/faq.repository.test.ts
const db = await createTestDb();  // in-memory SQLite
await db.insert(faq).values([...]);
const items = await getFaqItems(db, 'ru');
```

---

## Which layer for new content?

| Content type | Use |
|---|---|
| Button label, nav item, form placeholder, heading | Paraglide (`messages/*.json`) |
| Editable copy — prices, FAQ answers, review text | DB (`src/lib/db/seed.ts` + SQLite) |
| Shared across all locales (e.g. a logo URL) | Either; prefer Paraglide if it's truly static |

---

## Adding a new locale

1. Add the locale tag to `project.inlang/settings.json` → `languageTags`.
2. Create `messages/{tag}.json` with all keys translated.
3. Add an entry to the `LANGUAGES` map in `Header.svelte`.
4. Insert rows for the new locale into every DB content table (update `src/lib/db/seed.ts`).
5. Run `npm run db:seed`.
