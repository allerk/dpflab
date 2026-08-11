# External design handoff

## Approved inputs

- Current visible commercial, operational, identity, price, timing, result, guarantee and language facts are owner-confirmed in `08-claim-ledger.csv`.
- Current service routes and partner/removal handoffs are defined in `18-service-blueprint.md`.
- Page-level tasks, claim joins, prohibited extensions, CTA and CRM handoff are defined in `09-page-contracts.csv`.
- This handoff does not authorize new URLs, stronger claims, invented proof, production deployment or provider activation.

## Representative content and required states

- Use the current RU/ET/EN landing content as representative, not placeholder rectangles.
- Preserve the complete path: hero and next-step CTA; problem context; installed/removed/workshop handoff; starting prices plus exact-price qualifier; process; FAQ; three-step qualification form; localized validation/success/error states; contacts; privacy and cookie settings.
- Required operational states include `removed`, `workshop`, `installed` and `unsure`; the design must not imply that DPFLAB itself removes every installed filter.
- Limited cases and original photographs may be shown only when real, but their absence does not block the primary task.

## Accessibility and performance constraints

- Apply `19-quality-acceptance.md`: target WCAG 2.2 AA, keyboard-visible focus, 360 px reflow, reduced motion, labelled errors, server-rendered critical content and good Core Web Vitals thresholds as a field target.
- Keep the primary CTA and contact alternatives visible without allowing the mobile dock or consent panel to hide required actions.
- No third-party script before applicable consent; diagnostic provider state must remain distinct from CRM truth.

## Prohibited changes

Do not change approved URL ownership, claims, page roles, primary tasks, or schema eligibility without reopening the owning gate.

## Acceptance checks

- Every visual state uses the final localized content and the same claim refs as its page contract.
- A keyboard user can complete or correct every form step, and the first invalid field receives focus with a linked message.
- Structured data parses and mirrors visible owner-confirmed facts only.
- Responsive layouts have no document-level horizontal scrolling or broken images on the representative route matrix.
- ET/EN and privacy variants remain pending named linguistic/legal review before G6/G7 approval.
