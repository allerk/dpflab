# DPFLAB quality QA — 2026-08-11

Target: `19-quality-acceptance.md`  
Develop browser-runtime version: `af41c15a-82a3-4859-8d12-9b9b800732d5`  
Final synchronized develop version: `e4e2bbcc-f61b-4fd4-b66b-4e4f9ec7ed10`  
Immediate develop rollback version: `af41c15a-82a3-4859-8d12-9b9b800732d5`

## Scope and method

- Browser inspection of all six public production URLs and all six develop URLs at 1440×900.
- Responsive inspection of all six develop URLs at 390×844.
- DOM checks for document language, title, description, canonical, hreflang, one `h1`, JSON-LD parseability, duplicate IDs, labelled form fields, broken images and horizontal overflow.
- No-consent/necessary-only inspection for loaded Meta/Google tags.
- Invalid form scenarios on each of the three language routes; no customer data and no valid request were submitted.
- Local runtime retest before deployment and cache-busted develop runtime retest after deployment.
- Svelte/TypeScript check, full Vitest suite, production build, Drizzle migration check and `git diff --check`.

## Confirmed pre-fix results

| Area | Result |
|---|---|
| Public routes | 12/12 production/develop localized and privacy URLs loaded with one correct-language `h1`. |
| SEO basics | Canonical and reciprocal RU/ET/EN/x-default alternates were present on all representative routes. |
| Layout | No document-level horizontal overflow at desktop or 390 px; decorative overflow remained clipped. |
| Images | No broken published images in the browser route set. |
| Console | No error or warning entries in the develop browser run. |
| Consent necessary-only | No Meta Pixel, Google Analytics or Tag Manager element was loaded after choosing necessary-only. |
| Structured data | **Defect:** all three landing routes on production and develop emitted literal `{structuredData}`, which was invalid JSON. |
| Form errors | **Defect:** client errors were stored but the Svelte template did not react to indirect `errorMessage()` dependencies; users remained without visible/programmatically linked messages. |

## Implemented fixes

- Added a safe JSON-LD renderer that escapes `<`, U+2028 and U+2029 before inserting the whole script element; editable phone/email values cannot terminate the script tag.
- Kept `AutomotiveBusiness` limited to owner-confirmed visible identity, contact, address and image facts.
- Made validation conditions react directly to `clientErrors`.
- Added required semantics, stable error IDs, `role=alert`, `aria-describedby`, `aria-invalid` on applicable text/checkbox fields, hidden inactive steps, polite step updates and focus/scroll to the first invalid field.
- No service, price, timing, guarantee, result, identity or language claim was changed.

## Post-fix evidence

### Local runtime

- JSON-LD parsed and returned `@type=AutomotiveBusiness`.
- Empty step 1 focused `serviceType` and announced two localized required-choice errors.
- Step 2 with missing vehicle focused `#vehicle` and announced the vehicle/filter correction.
- Empty step 3 focused `preferredContact` and announced preferred contact, name, phone and privacy errors.
- The URL did not change and no valid submission was transmitted.

### Develop runtime after deployment

- RU, ET and EN landing pages: JSON-LD valid; correct language; one `h1`; no broken images; no horizontal overflow at 390 px.
- RU, ET and EN empty first-step scenario: first radio focused and two localized alerts rendered.
- RU, ET and EN privacy pages: correct language/title/canonical; one `h1`; no broken images or horizontal overflow.
- No Meta/Google tag elements appeared in the necessary-only browser state.
- Browser console returned no warnings or errors.
- Final version `e4e2bbcc` differs from the browser-tested version only by removing animated error scrolling; a cache-busted SSR smoke confirmed the final asset hash and valid JSON-LD.

### Automated verification

- `npm run check`: 0 errors, 0 warnings.
- `npm test`: 27 files, 130 tests passed.
- `npm run build`: Cloudflare production build passed.
- `npx drizzle-kit check`: passed.
- `git diff --check`: clean.

## Remaining limitations and blockers

- Production was intentionally not deployed and still has the invalid JSON-LD defect until G9/G10 production authorization.
- The Google PageSpeed API request returned HTTP 429 `RESOURCE_EXHAUSTED`; no Lighthouse/Core Web Vitals number is claimed. Field thresholds in `19-quality-acceptance.md` remain targets, not measured results.
- Accepted-then-revoked consent was not exercised against the live Meta provider to avoid creating diagnostic advertising traffic; code behaviour is present but runtime provider revocation remains `NOT_VERIFIED`.
- A valid lead, duplicate, authenticated CRM list/detail/expense workflow, outbox lease recovery and real Meta webhook remain outside this browser run. G2/G9 stay blocked until those deterministic scenarios are traced.
- ET/EN terminology and all privacy text still require the recorded linguistic/legal review before G6 can pass.
