# Decision pack

> Generated from project artifacts. Empty owner decisions remain empty; this renderer never approves recommendations.

## Project contract

# dpflab-ee — evidence-led website project

- Schema: `3`
- Audience contract: `1`
- Mode: `REBUILD`
- Depth: `CONTROLLED_MIGRATION`
- Entry point: `FULL`
- Primary profile: `LOCAL_OPERATIONAL_SERVICE`
- Markets: `Estonia; service area and partner coverage require owner confirmation`
- Languages: `ru|et|en`
- Authorized systems: `dpflab.ee read-only; dev.dpflab.ee; Cloudflare develop Worker/D1/R2; repository; Meta configuration read-only unless separately approved`
- Mutation boundary: `Code and develop are authorized; production launch, public claims, ad spend, customer-list processing, and provider enablement require an explicit owner decision`
- Commercial outcome chain: `visit/ad touch -> persisted lead -> contacted -> diagnostics/partner route -> qualified -> price confirmed -> booked -> filter received -> cleaning -> ready -> paid/completed -> business expenses -> operating contribution`
- Current gate: `G1`
- Owner: `Egor as delegated technical operator; Luka and Danik remain business/claims/launch owners`

## Scope

Apply the evidence-led workflow to the existing multilingual DPFLAB service site and its lead-to-CRM path. Preserve current production routes, advertising destinations, lead persistence, Cloudflare data, and rollback ability while identifying defects and deciding what the site may safely promise.

Current exclusions: no production deploy, no advertising spend or campaign mutation, no invented reviews/cases/guarantees/results, no Google activation, no files attached to CRM expenses, and no use of provider lead counts as commercial truth.

## Source map

Use `01-source-register.csv`. Preserve raw evidence outside this decision pack.

## Stop condition

First cycle stops at a reviewable G1-G3 decision pack: preserved baseline, explicit evidence gaps, measurement boundary, claim blockers, and the smallest method plan. Architecture/content/build work must not pass G4-G6 until Luka/Danik approve the applicable audience, operational and claim decisions.

## Routing policy

The selected Mode, Depth, and Entry point must satisfy `references/routing-contracts.csv`.
`04-method-plan.csv` is the canonical method stack; JSON is a standalone exchange adapter only.

## Gates

| Gate | Status | Blocker | Owner decision |
| --- | --- | --- | --- |
| G0 | PASS_WITH_RECORDED_RISK | Production launch and business-claim authority remain with Luka/Danik |  |
| G1 | BLOCKED | No GSC analytics ad-final-URL backlink log call/payment or complete legacy export |  |
| G2 | BLOCKED | No end-to-end real scenarios; Meta webhook lacks META_APP_SECRET; provider events disabled; privacy requirements unresolved |  |
| G3 | PASS_WITH_RECORDED_RISK | All selected methods remain PLANNED because owner/provider/research inputs are incomplete |  |
| G4 | BLOCKED | Audience rows are hypotheses; current search/ad evidence and owner route decisions are missing |  |
| G5 | BLOCKED | Starting prices 24h 98 percent guarantee coverage and identity details lack recorded prior evidence |  |
| G6 | BLOCKED | No approved audience route ownership or claim boundary; page contracts are intentionally empty |  |
| G7 | BLOCKED | No approved G4-G6 inputs for a design handoff |  |
| G8 | BLOCKED | Develop implementation passes automated checks but production has invalid JSON-LD and critical journeys are not fully runtime-tested |  |
| G9 | BLOCKED | D1 backup and public smoke pass; no complete authenticated journey accessibility/privacy/provider/rollback drill |  |
| G10 | BLOCKED | No owner launch decision and G9 is blocked |  |
| G11 | BLOCKED | No reconciled operating baseline or monitoring owner cadence |  |

## Open uncertainties

| ID | Decision | Risk if wrong | Owner | Status |
| --- | --- | --- | --- | --- |
| U-001 | Which service price timing result guarantee coverage and identity claims may remain public | Misleading advertising or a promise operations cannot fulfill | Luka and Danik | OPEN |
| U-002 | What exact customer and partner path must the site form and CRM represent | Qualified leads are routed incorrectly or website promises omit partner constraints | Luka and Danik | OPEN |
| U-003 | Which measurement paths are trustworthy for lead quality paid jobs revenue and advertising feedback | ROI is calculated from proxies or events are lost duplicated or processed without correct consent | Egor | OPEN |
| U-004 | Which URL should own each material service intent in each language | SEO/ad destinations are duplicated lost or expanded without demand and capability evidence | Luka and Danik | OPEN |
| U-005 | Which legacy URLs and destinations must be preserved before future structural changes | Organic equity ad traffic referrals or multilingual routes are silently lost | Egor | OPEN |
| U-006 | Which accessibility performance rendering privacy and search defects must be fixed before experiments | Hard defects remain while cosmetic experiments consume time | Egor | OPEN |

## Canonical method plan

| Uncertainty | Seq | Method | Authority | Status | Artifact use |
| --- | --- | --- | --- | --- | --- |
| U-001 | 10 | claim-substantiation | GATE | PLANNED | Constrain public copy metadata schema ads and page contracts |
| U-002 | 10 | service-blueprinting | PRIMARY | PLANNED | Align qualification form CRM stages partner handoff and follow-up |
| U-003 | 10 | measurement-integrity | PRIMARY | PLANNED | Define exactly which reports and provider events may be trusted |
| U-004 | 10 | search-intent-url-ownership | PRIMARY | PLANNED | Decide whether one page per language remains sufficient or a distinct owner is justified |
| U-005 | 10 | search-migration | GATE | PLANNED | Constrain all future route domain renderer and language changes |
| U-006 | 10 | web-quality-accessibility | GATE | PLANNED | Create mandatory implementation and staging defects ahead of optional growth work |

## Audience evidence and decisions

| ID | Market | Context | Task/job | Contradiction | Confidence | Recommendation | Owner decision | Channels | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-001 | Estonia | Vehicle owner/operator deciding what to do with a suspected DPF/FAP problem | Determine whether cleaning is applicable obtain the next step and understand who removes/transports the filter | UNASSESSED | LOW | Use as a research and service-blueprint hypothesis only |  |  | HYPOTHESIS |
| A-002 | Estonia | Workshop or service partner coordinating a removed/installed filter | Coordinate acceptance diagnostics cleaning return and payment responsibility | UNASSESSED | LOW | Validate as a separate operational scenario before giving it a dedicated page |  |  | HYPOTHESIS |
| A-003 | Estonia | English-language visitor considering the service | Understand eligibility process price drivers and contact DPFLAB | UNASSESSED | UNKNOWN | Keep EN technically available while treating acquisition value as unproven |  |  | HYPOTHESIS |

## Pending owner decisions

| ID | Area | Recommendation | Owner decision |
| --- | --- | --- | --- |
| D-001 | routing | Use REBUILD / CONTROLLED_MIGRATION / FULL because live multilingual URLs ads lead persistence CRM and Cloudflare data can be harmed |  |
| D-004 | public_claims | Treat current-site commercial statements as OBSERVED_ONLY until owner evidence is recorded |  |

## Claim blockers

| Claim | Text | Status | Language | Market | Expires |
| --- | --- | --- | --- | --- | --- |
| C-001 | DPF cleaning from 100 EUR | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-002 | Commercial-vehicle DPF cleaning from 200 EUR | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-003 | Cleaning/turnaround within 24 hours | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-004 | Restore up to 98 percent of flow capacity | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-005 | Guarantee of the cleaning result | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-006 | DPFLAB collects and returns the filter | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-007 | Works with all DPF and FAP filter types | OBSERVED_ONLY | ru\|et\|en | Estonia |  |
| C-008 | Motorlab OÜ identity address and opening hours shown on the site | OBSERVED_ONLY | ru\|et\|en | Estonia |  |

## Page and translation blockers

None recorded.

## Launch monitoring

| Check | Signal | Threshold | Cadence | Owner | Rollback | Status |
| --- | --- | --- | --- | --- | --- | --- |
| M-001 | public_route_status | Any critical route non-200 or wrong locale | pre-launch and daily for 7 days | Egor | Rollback Worker version; preserve D1 | PLANNED |
| M-002 | persisted_website_lead | Every accepted form creates exactly one complete row; invalid/duplicate scenarios match spec | before launch and after changes | Egor | Disable affected campaign destination or revert Worker | BLOCKED |
| M-003 | admin_access_and_tasks | Unauthorized request denied and authorized operator can complete critical tasks | before launch and after access/config change | Egor | Revert access/Worker config | BLOCKED |
| M-004 | meta_instant_lead_ingestion | Signed test lead creates one row; duplicate creates none; failure is retryable/visible | before enablement and daily diagnostics | Egor | Unsubscribe webhook or disable integration; retain platform lead export | BLOCKED |
| M-005 | paid_job_and_expense_reconciliation | No unexplained difference against payment/accounting record beyond owner-set tolerance | weekly | Luka/Danik | Stop using dashboard as financial truth and reconcile source rows | BLOCKED |
| M-006 | outbox_liveness | No event beyond retry/lease threshold; dead/skipped reasons visible | daily after provider enablement | Egor | Disable provider events while preserving CRM truth | BLOCKED |
| M-007 | search_and_ad_destinations | No valuable owner/final URL lost and no irrelevant redirect | pre-launch then weekly for 8 weeks | Egor | Rollback routes/redirects and restore prior owners | BLOCKED |
