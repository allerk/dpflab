---
name: styling
description: Style components with Tailwind CSS v4 (CSS-first config). Use when adding utility classes, defining design tokens, working with breakpoints, theming, or debugging cascade-layer issues. Triggers on mentions of Tailwind, app.css, breakpoints, @theme, @layer, design tokens, light theme, or responsive classes.
---

# Styling

Tailwind CSS v4 via `@tailwindcss/vite`. **No `tailwind.config.js`** — all configuration is CSS-first in `src/app.css` via `@theme`.

## Design tokens

Tokens in the `@theme` block generate utility classes:

| Token group | Examples | Utilities |
|---|---|---|
| Colors | `--color-accent`, `--color-bg`, `--color-bg-card`, `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-danger` | `bg-accent`, `text-fg-muted`, `border-border` |
| Radii | `--radius-btn`, `--radius-card`, `--radius-input` | `rounded-btn`, `rounded-card` |
| Spacing | `--spacing-header` (64px / 72px mobile), `--spacing-section`, `--spacing-container` (1180px max) | — |

Add a new token to `@theme` instead of hardcoding hex/px in components.

## Custom breakpoints

`--breakpoint-*: initial` clears Tailwind defaults, then explicit values:

| name | width  | use |
|------|--------|-----|
| `xs` | 480px  | tightest mobile (1-col grids, header padding) |
| `sm` | 600px  | section title shrink, hero padding |
| `md` | 900px  | main grid collapse (multi-col → 1-col) |
| `lg` | 1060px | desktop nav appears (`hidden lg:flex`), burger hides |
| `xl` | 1180px | compact-desktop tweaks |

`max-md:grid-cols-1` triggers below 900px. Changing a breakpoint shifts every component using that prefix — verify visually.

## Cascade-layer gotcha (important)

Tailwind utilities live in `@layer utilities`. **Un-layered CSS beats any cascade layer.** Any custom CSS in `app.css` MUST be wrapped:

- `@layer base` — element defaults (`html`, `h1-h4`, `main`)
- `@layer components` — helper classes (`.container`, `.section`, `.placeholder`, `.ba-*`)

If you write un-layered `.container { padding: 0 24px }`, it silently overrides every `py-3.5 px-6` applied to that element. The header collapses to zero vertical padding and nobody knows why. Always layer custom CSS.

## Light theme

`[data-theme="light"]` on `<html>` is un-layered — just CSS variable overrides (the only correct un-layered case, since it touches variables, not properties). A `@custom-variant light` directive enables `light:` prefix in markup.

## Layout invariants

- Header is `position: fixed` (transparent → blurred backdrop when `scrolled` flag flips at `window.scrollY > 12`).
- `main { padding-top: var(--spacing-header) }` in `@layer base` compensates for the out-of-flow header.
- `html { scroll-padding-top: var(--spacing-header) }` keeps anchor links from landing under the header.

## Conventions

- Reach for Tailwind utilities first. Fall back to `@layer components` for reusable helpers only.
- Don't introduce inline `<style>` blocks in `.svelte` files unless the rule can't be expressed as a utility (e.g., container queries, complex selectors).
- Replace `<div class="placeholder">` with `<img>` from `static/images/` or the admin upload flow.
