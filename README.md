# DPFLAB — SvelteKit

Landing page for DPFLAB, a DPF filter cleaning service in Estonia. Built with SvelteKit and vanilla CSS. Supports Russian and Estonian (EE) locales.

## Project structure

```
src/
  app.html              ← HTML shell with data-* theme attributes
  app.css               ← base styles + section styles (CSS variables)
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

Everything is controlled via CSS variables in `app.css`. Theme, accent colour, button style, card style, and spacing density are all toggled via `data-*` attributes on `<html>` (see `app.html`).
