# DPFLAB — SvelteKit

Landing page for DPFLAB, a DPF filter cleaning service in Estonia. Built with SvelteKit and Tailwind CSS v4. Supports Russian and Estonian (EE) locales.

## Project structure

```
src/
  app.html              ← HTML shell with data-theme="dark"
  app.css               ← Tailwind import + @theme tokens + @layer base/components
  lib/
    types.ts            ← content types (ContentBundle, Locale)
    content.ts          ← all copy for RU + EE locales
    stores.ts           ← writable<Locale> language store
    Icon.svelte         ← all icons via a single switch
    components/
      Header.svelte         ← sticky nav, language switcher, mobile drawer
      Hero.svelte           ← above-the-fold section
      WhyImportant.svelte   ← problem/solution explainer
      Process.svelte        ← 5-step process
      Pricing.svelte        ← pricing cards
      Benefits.svelte       ← 5 benefit icons
      BeforeAfter.svelte    ← before/after image slider grid
      BeforeAfterCard.svelte
      Reviews.svelte        ← customer reviews
      FAQ.svelte            ← accordion FAQ
      Certificates.svelte   ← trust badges
      ContactForm.svelte    ← lead capture form
      Footer.svelte
  routes/
    +layout.svelte      ← imports app.css
    +page.svelte        ← assembles all sections
```

## Setup

```bash
npm install
npm run dev
```

## What still needs to be done

1. **Content** — edit `src/lib/content.ts`. To add a language: create a new content object, add its code to the `Locale` type in `types.ts`, and add an entry to `LANGUAGES` in `Header.svelte`.
2. **Images** — replace each `<div class="placeholder">…</div>` with `<img src="…">`. Put real photos in `static/images/`.
3. **Form backend** — in `ContactForm.svelte` the `onSubmit` handler currently just shows a success state. Replace it with a SvelteKit form action or a `fetch` call to your API.
4. **SEO** — add meta tags in `+page.svelte` via `<svelte:head>`.
5. **Persistent language** — the `lang` store resets on page reload. Persist it to `localStorage` or read it from the URL (`?lang=ee`).

## Design system

Tokens live in the `@theme` block in `src/app.css` (colors, radii, spacing, custom breakpoints). Tailwind generates utilities from them (`bg-accent`, `rounded-card`, etc.). Light theme is toggled via `data-theme="light"` on `<html>`.

Custom breakpoints replace Tailwind defaults: `xs: 480 / sm: 600 / md: 900 / lg: 1060 / xl: 1180`.

Custom CSS belongs in `@layer base` (elements) or `@layer components` (helper classes) so Tailwind utilities can still override them — un-layered CSS beats every layer in the cascade.
