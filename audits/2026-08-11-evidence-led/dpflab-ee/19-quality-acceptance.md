# DPFLAB quality acceptance target

Date: 2026-08-11  
Scope: the six public RU/ET/EN landing and privacy routes, the public qualification form, consent controls, and the authenticated CRM critical path on develop.

This is the implementation target for the current quality pass. It is not a public conformance or performance claim. A target becomes a passed gate only after representative runtime evidence is attached.

## Mandatory release criteria

### Accessibility and interaction

- Target WCAG 2.2 Level AA for complete public pages and responsive variations.
- One logical `h1`, correct document language, named form controls, visible keyboard focus, no keyboard trap, and no focus hidden by sticky controls.
- Critical actions remain operable at 360 CSS px width and at 200% browser zoom without horizontal page scrolling.
- Form errors identify the field and the correction; step changes and success/failure states are exposed to assistive technology.
- Motion and non-essential animation respect `prefers-reduced-motion`.

Reference: https://www.w3.org/TR/WCAG22/

### Rendering and search

- Every public route returns HTTP 200, has one canonical URL, one indexable language variant, reciprocal alternates where implemented, and no contradictory robots directive.
- Server-rendered title, description, `h1`, canonical and structured data are complete without client JavaScript.
- Every JSON-LD block parses as JSON and contains only owner-confirmed facts already represented on the site.
- Images load without broken resources and meaningful images have appropriate text alternatives.

### Privacy and measurement

- No Meta or Google analytics script, cookie, browser advertising identifier, or persistent click identifier is created before analytics consent.
- Revoking consent updates loaded providers, removes known analytics cookies, and prevents new browser measurement identifiers from entering form submissions.
- A persisted lead is not presented as a qualified lead, booking, paid order, revenue or profit until that corresponding CRM state exists.
- Provider delivery is labelled verified only after an end-to-end observed event; disabled and missing-secret states stay explicit.

### Reliability

- Public form validation can be completed by keyboard and blocks invalid submissions without creating a lead.
- A valid lead must persist once, duplicates must not create duplicate provider events, and CRM stage changes plus outbox events must survive retry or worker restart.
- Develop must pass type/Svelte checks, automated tests, production build, migration check, public-route smoke tests and the browser scenario set before production is considered.
- Production remains unchanged until a fresh rollback artifact and an explicit production decision exist.

### Performance target

- Field target at the 75th percentile: LCP at or below 2.5 s, INP at or below 200 ms, and CLS at or below 0.1.
- Until enough field data exists, lab results are diagnostic only and must be labelled by URL, device profile, run date and network/CPU conditions.
- No new third-party script may be enabled without consent behaviour, payload purpose and measurable performance cost being reviewed.

Reference: https://web.dev/articles/defining-core-web-vitals-thresholds

## Representative test matrix

| Surface | Desktop | Mobile | Keyboard | No consent | Accepted then revoked | Server-rendered |
|---|---:|---:|---:|---:|---:|---:|
| RU landing and form | required | required | required | required | required | required |
| ET landing and form | required | required | required | required | representative | required |
| EN landing and form | required | required | required | required | representative | required |
| RU/ET/EN privacy | required | required | representative | required | n/a | required |
| CRM lead list/detail/expense path on develop | required | required where supported | required | n/a | n/a | required |

## Release decision rule

- P0/P1 defects in a mandatory criterion block production.
- P2 defects may be time-bounded only with an owner, due date, impact statement and rollback-safe workaround.
- Missing evidence is `NOT_VERIFIED`, never an implicit pass.
