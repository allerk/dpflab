# SEO Meta Tags

This document covers the current meta tag implementation, how to update copy, and how to run future optimisation passes using the `/aaron-seo-geo:meta-tags-optimizer` Claude Code skill.

---

## Current implementation

All meta tags live in `src/routes/+page.svelte` inside `<svelte:head>`. The block is locale-aware — it switches automatically between Russian (`/`) and Estonian (`/et`) using Paraglide messages and the `data.locale` value from `+page.server.ts`.

**Tags wired:**

| Tag | Purpose |
|-----|---------|
| `<title>` | Primary SERP title |
| `<meta name="description">` | SERP snippet |
| `<meta name="robots">` | Crawl directive (`index, follow`) |
| `<link rel="canonical">` | Prevents duplicate-content penalty |
| `<link rel="alternate" hreflang>` | `ru`, `et`, and `x-default` signals to Google |
| `og:type / title / description / url / site_name / locale / image` | Facebook, LinkedIn, Telegram previews |
| `og:locale:alternate` | Signals the alternate-language variant |
| `twitter:card / title / description / image` | Twitter/X previews |

**Hardcoded constant in `+page.svelte`:**

```ts
const BASE_URL = 'https://dpflab.ee';
```

Update this if the domain ever changes.

---

## Editing title & description copy

Meta title and description are Paraglide message keys — edit them the same way as any other UI string:

```jsonc
// messages/ru.json
"meta_title": "Очистка DPF фильтров в Эстонии — от 150€ | DPFLAB",
"meta_description": "Очистка DPF фильтра в Таллине от 150€. ..."
```

```jsonc
// messages/et.json
"meta_title": "DPF filtri puhastus Eestis — alates 150€ | DPFLAB",
"meta_description": "DPF filtri puhastus Tallinnas alates 150€. ..."
```

After editing, regenerate Paraglide (happens automatically on `npm run dev` / `npm run build`; or run manually):

```bash
npx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
npm run check   # verify 0 errors
```

**Limits to stay within:**

| Tag | Chars |
|-----|-------|
| `meta_title` | 50–60 |
| `meta_description` | 150–160 |

---

## OG image

The tags reference `/images/og-dpflab.jpg` which does not yet exist.

**To activate social previews:**
1. Create a 1200 × 630 px image (before/after composite or branded DPF photo).
2. Save it as `static/images/og-dpflab.jpg`.
3. Verify at [opengraph.xyz](https://www.opengraph.xyz) after deploying.

Consider locale-specific OG images in the future (`og-dpflab-et.jpg`) — they can be wired by replacing the static string in `+page.svelte` with a reactive expression keyed on `data.locale`.

---

## Running a future optimisation pass

The project has the `aaron-seo-geo` plugin installed. To re-optimise meta tags at any point:

```
/aaron-seo-geo:meta-tags-optimizer
```

The skill will ask for:
- current title + description (copy from `messages/ru.json` / `et.json`)
- target keywords (use "DPF очистка Эстония" / "DPF filtri puhastus Eesti")
- competitor URLs if available
- any CTR data from Google Search Console

**What to bring to an optimisation session:**

1. GSC data — top queries, impressions, CTR for `dpflab.ee`
2. Current average position for primary keywords
3. Any seasonal pricing changes (price anchor in title should stay accurate)
4. New locale if one is added (see `wiki/translation-strategy.md` → "To add a locale")

**Recommended optimisation cadence:** after 3 months of GSC data, then when rankings plateau or a new service/price is added.

---

## Planned next steps

| Item | Priority | Notes |
|------|----------|-------|
| Add `og-dpflab.jpg` to `static/images/` | High | Needed for social sharing previews |
| Schema markup (`LocalBusiness` + `Service`) | Medium | Run `/aaron-seo-geo:schema-markup-generator` — natural next step after meta tags |
| GSC property verification | Medium | Add `<meta name="google-site-verification">` once GSC is set up |
| Locale-specific OG images | Low | Only worthwhile if CTR data shows locale split matters |
| A/B test: problem-hook title variant | Low | "DPF фильтр засорён? Очистка за 24 часа..." — test via GSC impressions after ~90 days |
