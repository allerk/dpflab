# TODO

## 1. Preserve scroll position on language switch

When the user switches language
the page reloads (`window.location.href`) and scrolls back to the top.
Expected: stay at the same scroll position after language change.

---

## 2. Hybrid i18n + SQLite content plan

Paraglide handles UI chrome (nav, buttons, headings, validation).  
SQLite + Drizzle handles editable business content (prices, FAQ, reviews, etc.).

### Setup

2. Install dependencies:
   ```bash
   npm install drizzle-orm @libsql/client
   npm install -D drizzle-kit
   ```

3. Create `drizzle.config.ts` at project root pointing to `./data/dpflab.db`.

4. Write schema in `src/lib/db/schema.ts` — tables: `faq`, `reviews`, `pricing`,
   `certificates`, `contacts`, `contact_submissions`. Each content table has a
   `locale` column (`'ru' | 'ee'`) and a `sort_order` column.

5. Create `src/lib/db/index.ts` — instantiate and export the Drizzle client.

6. Run `drizzle-kit push` to create the SQLite file and tables.

7. Write a seed script (`src/lib/db/seed.ts`) that inserts the current content
   from `messages/ru.json` and `messages/ee.json` into the DB.

### Data layer

8. Create `src/routes/+page.server.ts` — load function queries all DB-driven
   content in parallel (`Promise.all`) filtered by current locale, returns typed
   data to the page.

9. Update `src/routes/+page.svelte` — destructure `data` from the load function
   and pass DB content as props to the relevant section components.

### Components

10. **FAQ** — accept `items: { question: string; answer: string }[]` prop instead
    of calling message functions. Keep Paraglide for the section heading.

11. **Reviews** — accept `items: { stars: number; text: string; author: string }[]` prop.

12. **Pricing** — accept `items: { icon: string; title: string; price: string; cta: string }[]` prop.

13. **Certificates** — accept `items: { title: string; text: string }[]` prop.

14. **ContactForm** — replace the fake `onSubmit` with a SvelteKit form action
    (`+page.server.ts` `actions`) that inserts a row into `contact_submissions`.

### Cleanup

15. Remove the keys for DB-driven content from `messages/ru.json` and
    `messages/ee.json` (faq, reviews, pricing, certificates, contact info).

16. Update `contacts_phone`, `contacts_email`, `contacts_address`, `contacts_hours_*`
    to read from the `contacts` table (single row) instead of Paraglide messages.
