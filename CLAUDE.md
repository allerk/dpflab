# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server (hot reload)
npm run build      # production build → .svelte-kit/cloudflare/
npm run check      # TypeScript + Svelte type-check (no separate lint step)
```

### Deploying to Cloudflare Pages

There is no CI/CD git connection — every deploy is manual:

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name dpflab --commit-dirty=true
```

Config lives in `wrangler.jsonc`. Node version is pinned in `.nvmrc` (24.15.0).

## Architecture

Single-page SvelteKit landing site with `@sveltejs/adapter-cloudflare`. All page sections are assembled in `src/routes/+page.svelte` as a flat list of section components. There is no routing beyond the single page.

### Content & i18n

All copy for both locales lives in **`src/lib/content.ts`** as two typed `ContentBundle` objects (`ru`, `ee`), exported as `CONTENT: Record<Locale, ContentBundle>`.

The active locale is a Svelte writable store (`src/lib/stores.ts` → `lang`). `+page.svelte` derives `t = CONTENT[$lang]` and passes it down as a prop to every section component. No locale is persisted across page reloads.

To add a locale: add it to the `Locale` union in `types.ts`, create a new `ContentBundle` in `content.ts`, and add an entry to the `LANGUAGES` array in `Header.svelte`.

### Design system

All visual tokens are CSS custom properties defined in **`src/app.css`** (single file for both base/reset and all section styles). Theming and variants are driven by `data-*` attributes on `<html>` (set in `src/app.html`):

- `data-theme="light"` — light mode overrides
- `data-button-style` — `square | rounded | pill`
- `data-card-style` — `flat | shadow | bordered`
- `data-density` — `compact | spacious`

`--header-h` (64px desktop, 72px mobile) is used for both `main { padding-top }` and `scroll-padding-top` on `html`. Keep these in sync if header height changes.

### Icons

**`src/lib/Icon.svelte`** is a single-component icon registry — one `{#if name === '...'}` branch per SVG. To use a new icon, add a branch here; there is no external icon library.

### Placeholder content

Image slots are `<div class="placeholder">` elements. Replace with `<img src="...">` pointing to files in `static/images/`. The contact form `onSubmit` currently fakes success — it needs a real `fetch` or SvelteKit form action wired up.
