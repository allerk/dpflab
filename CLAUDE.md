# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server (hot reload)
npm run build      # production build → build/
npm run check      # TypeScript + Svelte type-check (no separate lint step)
```

### Running in production (zone.ee / any Node host)

```bash
npm run build
node build/index.js   # starts the HTTP server (PORT env var, default 3000)
```

Node version is pinned in `.nvmrc` (24.15.0).

## Architecture

Single-page SvelteKit landing site with `@sveltejs/adapter-node`. All page sections are assembled in `src/routes/+page.svelte` as a flat list of section components. There is no routing beyond the single page.

### i18n: Paraglide JS v2

Locale is URL-based: `/` → Russian (default), `/ee` → Estonian. Switching language triggers a full page reload (`window.location.href`) so the server sets the locale correctly via middleware.

**Key files:**
- `messages/ru.json`, `messages/ee.json` — all translatable strings as flat JSON. Edit these to change copy.
- `src/lib/paraglide/` — **generated at build time, gitignored.** Never edit manually.
- `src/hooks.server.ts` — `paraglideMiddleware` reads locale from URL, injects `%lang%`/`%dir%` into `app.html`.
- `src/hooks.ts` — `deLocalizeUrl` maps `/ee/` → `/` so SvelteKit routes it to `+page.svelte`.

**Using messages in components** — named imports only, no namespace import:
```ts
import { nav_home, hero_subtitle } from '$lib/paraglide/messages';
// then call as nav_home(), hero_subtitle() in template or $: blocks
```

**Detecting current locale reactively** (e.g. in Header):
```ts
import { page } from '$app/stores';
import { getLocaleForUrl } from '$lib/paraglide/runtime';
$: currentLocale = getLocaleForUrl($page.url.href); // reactive to navigation
```

**Language switching** — use `localizeHref` + `deLocalizeHref` from `$lib/paraglide/runtime`, then `window.location.href` for a full reload:
```ts
import { localizeHref, deLocalizeHref } from '$lib/paraglide/runtime';
window.location.href = localizeHref(deLocalizeHref($page.url.pathname), { locale: 'ee' });
```

**To add a locale:** add the tag to `project.inlang/settings.json` → `languageTags`, create `messages/{tag}.json`, add an entry to `LANGUAGES` in `Header.svelte`.

### Styling: Tailwind CSS v4

Components use Tailwind utility classes. The `@tailwindcss/vite` plugin is wired in `vite.config.ts`; there is no `tailwind.config.js` — all configuration is CSS-first in `src/app.css` via the `@theme` directive.

**Design tokens** (in `app.css` `@theme` block) generate utility classes:
- Colors: `--color-accent`, `--color-bg`, `--color-bg-card`, `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-danger` → `bg-accent`, `text-fg-muted`, `border-border`, etc.
- Radii: `--radius-btn`, `--radius-card`, `--radius-input` → `rounded-btn`, etc.
- Spacing: `--spacing-header` (64px / 72px mobile), `--spacing-section`, `--spacing-container` (max-width 1180px).

**Custom breakpoints** replace Tailwind's defaults via `--breakpoint-*: initial` then explicit redefinition:

| name | width  | use |
|------|--------|-----|
| `xs` | 480px  | tightest mobile (1-col grids, header padding) |
| `sm` | 600px  | section title shrink, hero padding |
| `md` | 900px  | main grid collapse point (most multi-col → 1-col) |
| `lg` | 1060px | desktop nav appears (`hidden lg:flex`), burger hides |
| `xl` | 1180px | compact-desktop tweaks (smaller nav font) |

So `max-md:grid-cols-1` triggers below 900px, `lg:hidden` hides ≥1060px, etc. **If you change a breakpoint, every component using `xs:`/`sm:`/`md:`/`lg:`/`xl:` shifts.**

**Cascade-layer gotcha**: Tailwind utilities are in `@layer utilities`. Un-layered CSS *beats* any cascade layer, so any custom CSS in `app.css` MUST be wrapped in `@layer base` (element defaults like `html`, `h1-h4`, `main`) or `@layer components` (helper classes like `.container`, `.section`, `.placeholder`, `.ba-*`). Otherwise utility classes silently get overridden — e.g. `.container { padding: 0 24px }` un-layered beats `py-3.5 px-6` and the header collapses to no vertical padding.

**Light theme**: `[data-theme="light"]` on `<html>` (un-layered, just CSS variable overrides) flips `--color-bg`/`--color-fg`/etc. The `@custom-variant light` directive enables a `light:` prefix in markup if needed.

### Layout invariants

- The header is `position: fixed` with transparent background by default and a translucent blurred backdrop when `scrolled` (set after `window.scrollY > 12`). To compensate for being out of document flow, `main { padding-top: var(--spacing-header) }` is set in `@layer base`.
- `scroll-padding-top` on `html` uses the same `--spacing-header` so anchor links land below the fixed header.

### Icons

**`src/lib/Icon.svelte`** is a single-component icon registry — one `{#if name === '...'}` branch per SVG. To use a new icon, add a branch here; there is no external icon library.

### Placeholder content

Image slots are `<div class="placeholder">` elements (the `.placeholder` class lives in `app.css` `@layer components`). Replace with `<img src="...">` pointing to files in `static/images/`. The contact form `onSubmit` currently fakes success — it needs a SvelteKit form action wired up (see TODO.md).
