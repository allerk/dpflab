# Dev hero direction — filter substrate

Status: `DEV_CANDIDATE_FOR_OWNER_FEEDBACK`
Production authorization: `NONE`

## Grounding

- Subject: DPF/FAP cleaning in a small operational workshop/lab in Estonia.
- Primary audience: a vehicle owner or workshop representative deciding whether
  to request a price and how the filter enters the service path.
- Page job: preserve the confirmed service explanation and make the qualification
  form the obvious next step without strengthening any claim.

## Design system for this iteration

- `soot ink #101513`: display text, image cassette and primary action.
- `filter ceramic #E8EBE4`: hero working surface.
- `steel #59615C`: explanatory text and rules.
- `signal green #7ED321`: one status/highlight color retained from the logo.
- Display: condensed industrial system stack used only for the hero thesis.
- Body: existing system UI stack; utility labels: system monospace.

The signature is a clipped filter-cassette image sitting over a perforated
substrate matrix. It references the physical DPF object without introducing fake
test data, gauges, percentages or laboratory certification.

## Layout

```text
desktop
┌──────────────────────────────┬─────────────────────────┐
│ DPFLAB — DPF/FAP             │  perforated matrix     │
│ LARGE SERVICE THESIS         │  clipped real image     │
│ confirmed supporting copy    │                         │
│ [request price →]            │                         │
├─────────┬─────────┬──────────┤                         │
│ timing  │ result  │ delivery │                         │
└─────────┴─────────┴──────────┴─────────────────────────┘

mobile
┌──────────────────────────────┐
│ thesis + copy + full CTA     │
├──────────────────────────────┤
│ clipped image                │
├──────────────────────────────┤
│ three stacked service facts  │
└──────────────────────────────┘
```

## Deliberate revision

The first draft was still too close to a generic black-and-acid-green landing
page and let the long RU title split inside a word. The revision:

- moved the hero to a ceramic substrate surface and limited green to signal use;
- prevents intra-word title breaks and reduced display scale;
- moved the consent panel away from the primary CTA on desktop;
- removed a redundant technical label after screenshot critique;
- uses the bundled optimized hero as a resilient fallback when the database image
  is empty, avoiding a public placeholder.

## Verification

- RU/ET/EN local desktop runtime: correct locale, whole-word title wrapping,
  visible CTA, `1280/1280` document width, no broken image.
- Consent panel no longer covers the primary CTA at the tested desktop viewport.
- `npm run check`: 0 errors, 0 warnings.
- `npm test`: 27 files, 130 tests passed.
- `npm run build`: passed.
- Mobile CSS is explicitly defined for the single-column layout and long title,
  but a fresh 390 px runtime is `NOT_VERIFIED`: both connected browser viewport
  controls remained at desktop width and Python Playwright was unavailable.

## Mutation boundary

This direction may be deployed only to develop for owner feedback. It changes no
route, price, guarantee, result, service responsibility, structured data,
analytics event or CRM handoff. Production remains frozen until a separate
decision and a real mobile runtime check exist.
