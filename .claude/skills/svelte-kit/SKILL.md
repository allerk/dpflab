---
name: svelte-kit
description: Build pages, components, and server endpoints in this SvelteKit + Paraglide app. Use when editing routes, +page.server.ts, +layout.svelte, Svelte components, hooks.server.ts, or wiring i18n via Paraglide messages. Triggers on mentions of SvelteKit, Svelte, paraglide, locale, +page, hooks.server, or load functions.
---

# SvelteKit

Single-page landing site with `@sveltejs/adapter-node`. Hot reload via `npm run dev`.

## Page architecture

- `src/routes/+page.svelte` — assembles all section components in order; one flat list, no nested routing.
- `src/routes/+page.server.ts` — `load` queries every DB table in parallel via `Promise.all`, keyed by `locals.locale`. Wrap in try/catch so a DB miss still renders the page with empty arrays. `actions.default` handles the contact form.
- `src/routes/admin/` — separate CRUD UI; auth lives in `tests/admin/whitelist.test.ts` patterns.
- `src/lib/components/<Name>.svelte` — one section per file. Components receive typed props from `+page.server.ts`.

## i18n: Paraglide v2 + SQLite (hybrid)

Two layers (see `wiki/translation-strategy.md`):

- **Paraglide** owns static UI chrome — nav, buttons, headings, validation. Edit `messages/ru.json` / `messages/et.json`.
- **SQLite** owns editable content — FAQ, reviews, pricing. See [[database]] for the `langstr` helper.

Locale is URL-based: `/` → ru (default), `/et` → et. `hooks.server.ts` reads it via `paraglideMiddleware` and stores it on `event.locals.locale`. `hooks.ts` de-localizes the URL so both locales hit `+page.svelte`.

**Using messages (named imports, never namespace):**

```ts
import { nav_home, hero_subtitle } from '$lib/paraglide/messages';
// call as functions in markup: {nav_home()}
```

**Reactive current locale:**

```ts
import { page } from '$app/stores';
import { getLocaleForUrl } from '$lib/paraglide/runtime';
$: currentLocale = getLocaleForUrl($page.url.href);
```

**Switching locale** — force a full reload so the server sets locale correctly:

```ts
import { localizeHref, deLocalizeHref } from '$lib/paraglide/runtime';
window.location.href = localizeHref(deLocalizeHref($page.url.pathname), { locale: 'et' });
```

**Adding a locale:** add tag to `project.inlang/settings.json` → `languageTags`, create `messages/<tag>.json`, add to `LANGUAGES` in `Header.svelte`, insert rows for the new locale in every content table.

## Conventions

- Never edit files in `src/lib/paraglide/` — generated at build, gitignored.
- Image slots are `<div class="placeholder">`; swap to `<img src="/images/...">` (files served from `static/images/` or admin-uploaded `data/images/`).
- Icons are a single registry in `src/lib/Icon.svelte` (one `{#if name === '...'}` per SVG) — no external icon library.
- Don't add client-side routing — this is a single page with anchor sections.
