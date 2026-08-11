# Registration-number intake — implementation and verification

Date: 2026-08-11  
Decision: D-009  
Scope: website, D1/CRM, Meta Lead Ads candidates and privacy disclosure; develop-only website deployment; no production or ad mutation.

## Approved qualification contract

- Every new website lead and staff-created CRM lead requires a vehicle registration number.
- New Meta candidates ask the same required custom question with key `registration_number` in RU, ET and EN.
- Visible helper text explains the bounded purpose: confirm the model/variant, check the applicable filter and calculate a more accurate price.
- The site does not promise instant lookup, the exact fitted part or an automatic price.
- Existing `vehicle` values remain intact for legacy leads and later enriched model/engine data. They are never reinterpreted as a registration number.
- Values are uppercased and whitespace/dashes normalized, while foreign and personalized formats are not rejected by an Estonia-only template.

## Implementation evidence

- The additive `registration_number` D1 column already existed in migration `0010`; no new destructive migration was needed.
- Public form action persists only `registrationNumber` for the new qualification field and records privacy version `2026-08-11`.
- Meta normalization accepts `registration_number`; the repository preserves legacy `vehicle` and sends the new value through the common CRM writer.
- CRM new/list/detail surfaces make the registration number the primary vehicle identifier and include it in list search.
- `META_LEADS_FORM_LOCALES` retains old form IDs and adds all three new candidates so old leads remain language-compatible.

## Meta Graph evidence

The API token retrieved a Page access token, confirmed accepted Lead Ads terms, created the three new forms, and re-read their actual questions. Meta reports API-created library forms as `ACTIVE`; `[DRAFT]` is the review naming convention, not a provider status.

| Language | Form ID | Provider status | Verified custom question |
| --- | --- | --- | --- |
| RU | `27980848328265828` | `ACTIVE` | `registration_number` / `Государственный номер автомобиля (например, 123 ABC)` |
| ET | `1395333806136980` | `ACTIVE` | `registration_number` / `Sõiduki registreerimisnumber (näiteks 123 ABC)` |
| EN | `27487810977557355` | `ACTIVE` | `registration_number` / `Vehicle registration number (for example, 123 ABC)` |

Meta v25 did not expose an Estonian Instant Form locale during creation, so the ET candidate uses `EN_GB` as its provider locale while all supplied custom copy is Estonian. Meta-owned standard labels may therefore remain English; this limitation must be reviewed in the Forms Library before attachment.

A separate read-only scan checked both current ads in `act_1488895229206352`; none references any new form ID. No ad, campaign, budget, publication choice or destination was changed.

## Local runtime evidence

- `npm run check`: 0 errors and 0 warnings.
- Full Vitest before the final UX fix: 28 files / 134 tests; focused post-fix suite: 5 files / 22 tests.
- Production Cloudflare build: pass.
- Local D1 migrations: no pending migrations.
- Bundled Chromium at 390 × 844 passed RU, ET and EN step flow, localized label/help, empty-field error, focus transfer, error clearing and normalization-on-blur.
- A valid RU request persisted `registration_number = 123 ABC`, `vehicle = ''` and `privacy_version = 2026-08-11`; all local QA rows were deleted after verification.
- Visual artifact: `evidence/registration-number-ru.png`.

## Develop runtime evidence

- Commit `153c540` was deployed only to the develop Worker as version `a426e523-262b-4071-81ef-c2dc64d354ec`.
- Plain `/`, `/et` and `/en` responses expose the localized registration-number field; the develop response retains `X-Robots-Tag: noindex, nofollow, noarchive`.
- Live bundled Chromium at 390 × 844 passed the RU, ET and EN step flow, required-field message and focus, correction-state clearing and normalization to `123 ABC`; the live run did not submit a lead.
- A read-only remote D1 count remained `8`, confirming that the negative/live non-submit checks did not create a row.
- Production was not deployed or otherwise mutated by this decision; a final public read confirmed it still exposes the legacy field rather than this develop change.

## Future lookup boundary

Transpordiamet documents an AVP exchange service that can accept a registration mark and return selected basic/technical vehicle data groups. The documented service requires a separate agreement/access basis and paid packages. It does not by itself identify the fitted DPF/FAP part or prove that DPFLAB can quote automatically. A later automation therefore needs:

1. owner approval and an AVP agreement/access basis;
2. a verified vehicle-data response contract;
3. a separate parts-catalog mapping from vehicle variant to applicable filter;
4. pricing rules and manual fallbacks for ambiguous/missing results;
5. privacy/legal review and end-to-end test cases before any instant-price claim.

Official capability source: https://transpordiamet.ee/andmevahetusplatvorm

## Remaining gates

- Website production remains frozen and requires a new G9/G10 decision before this develop artifact can be released.
- Meta forms remain review candidates until Luka/Danik approve wording and an operator explicitly attaches chosen IDs to ads.
- ET/EN terminology and privacy text remain `PENDING_REVIEW`; technical parity is verified, linguistic/legal approval is not inferred.
