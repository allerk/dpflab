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
- Markets: `Estonia; current public service scope and partner-facing statements are owner-confirmed`
- Languages: `ru|et|en`
- Authorized systems: `repository; Cloudflare develop Worker/D1/R2; one approved 2026-08-11 production Worker/D1 release; Meta configuration read-only unless separately approved`
- Mutation boundary: `Production release ca54958 is complete and frozen; subsequent code/content changes return to develop; public claims, ad spend, customer-list processing, provider enablement, and another production release require an explicit owner decision`
- Commercial outcome chain: `visit/ad touch -> persisted lead -> contacted -> diagnostics/partner route -> qualified -> price confirmed -> booked -> filter received -> cleaning -> ready -> paid/completed -> business expenses -> operating contribution`
- Current gate: `G11`
- Owner: `Egor as delegated technical operator; Luka and Danik remain business/claims/launch owners`

## Scope

Apply the evidence-led workflow to the existing multilingual DPFLAB service site and its lead-to-CRM path. Preserve current production routes, advertising destinations, lead persistence, Cloudflare data, and rollback ability while identifying defects and deciding what the site may safely promise.

Current exclusions: no further production mutation in this cycle, no advertising spend or campaign mutation, no invented reviews/cases/guarantees/results, no Google activation, no files attached to CRM expenses, and no use of provider lead counts as commercial truth.

## Source map

Use `01-source-register.csv`. Preserve raw evidence outside this decision pack.

## Stop condition

Production version `e72d063a-3bf6-4f4c-b3c2-3411266def70` is frozen after the explicit 2026-08-11 release decision, D1 backup/migrations and production smoke. The next cycle returns to reversible develop-only work; another production change requires a new G9/G10 decision. Structural URL expansion remains blocked by G1/G4 even though current public facts are approved.

## Routing policy

The selected Mode, Depth, and Entry point must satisfy `references/routing-contracts.csv`.
`04-method-plan.csv` is the canonical method stack; JSON is a standalone exchange adapter only.

## Gates

| Gate | Status | Blocker | Owner decision |
| --- | --- | --- | --- |
| G0 | PASS_WITH_RECORDED_RISK | The delegated technical operator explicitly authorized this release; direct Luka/Danik approval is not separately attached | APPROVED_PRODUCTION_DEPLOY_BY_OPERATOR |
| G1 | BLOCKED | No GSC analytics ad-final-URL backlink log call/payment or complete legacy export |  |
| G2 | BLOCKED | No end-to-end real scenarios; Meta webhook lacks META_APP_SECRET; provider events disabled; privacy requirements unresolved |  |
| G3 | PASS_WITH_RECORDED_RISK | Claim substantiation and service blueprint are complete and web quality is active; search migration and measurement inputs remain incomplete |  |
| G4 | BLOCKED | Audience rows are hypotheses; current search/ad evidence and owner route decisions are missing |  |
| G5 | PASS_WITH_RECORDED_RISK | No external case/test files are attached; this does not block the owner-confirmed current claims but limits stronger extensions | APPROVE_CURRENT_SITE_FACTS |
| G6 | BLOCKED | Page contracts and claim joins exist but ET/EN terminology and privacy/legal translations are not reviewed; G4 route ownership remains unresolved |  |
| G7 | BLOCKED | A bounded hero candidate exists on develop, but G4/G6 inputs remain unapproved and the fresh 390 px runtime is not verified | APPROVED_DEVELOP_ONLY |
| G8 | BLOCKED | Production public routes structured data form validation images and Access boundary passed, but G4/G6/G7 prerequisites and authenticated CRM/provider scenarios remain unverified | DEPLOYED_BY_EXPLICIT_OPERATOR_OVERRIDE |
| G9 | BLOCKED | Fresh D1 backup rollback Worker additive migrations local valid lead and production public/invalid-form smoke passed, but URL decisions and the complete staging matrix remain unverified | DEPLOYED_BY_EXPLICIT_OPERATOR_OVERRIDE |
| G10 | BLOCKED | The delegated technical operator explicitly instructed and completed the bounded release while hard G8/G9 prerequisites remained blocked; direct Luka/Danik approval is not separately attached | DEPLOYED_BY_EXPLICIT_OPERATOR_OVERRIDE |
| G11 | BLOCKED | No reconciled operating baseline or monitoring owner cadence |  |

## Open uncertainties

| ID | Decision | Risk if wrong | Owner | Status |
| --- | --- | --- | --- | --- |
| U-003 | Which measurement paths are trustworthy for lead quality paid jobs revenue and advertising feedback | ROI is calculated from proxies or events are lost duplicated or processed without correct consent | Egor | OPEN |
| U-004 | Which URL should own each material service intent in each language | SEO/ad destinations are duplicated lost or expanded without demand and capability evidence | Luka and Danik | OPEN |
| U-005 | Which legacy URLs and destinations must be preserved before future structural changes | Organic equity ad traffic referrals or multilingual routes are silently lost | Egor | OPEN |
| U-006 | Which accessibility performance rendering privacy and search defects must be fixed before experiments | Hard defects remain while cosmetic experiments consume time | Egor | IN_PROGRESS |

## Canonical method plan

| Uncertainty | Seq | Method | Authority | Status | Artifact use |
| --- | --- | --- | --- | --- | --- |
| U-001 | 10 | claim-substantiation | GATE | COMPLETE | Constrain public copy metadata schema ads and page contracts |
| U-002 | 10 | service-blueprinting | PRIMARY | COMPLETE | Align qualification form CRM stages partner handoff and follow-up |
| U-003 | 10 | measurement-integrity | PRIMARY | PLANNED | Define exactly which reports and provider events may be trusted |
| U-004 | 10 | search-intent-url-ownership | PRIMARY | PLANNED | Decide whether one page per language remains sufficient or a distinct owner is justified |
| U-005 | 10 | search-migration | GATE | PLANNED | Constrain all future route domain renderer and language changes |
| U-006 | 10 | web-quality-accessibility | GATE | ACTIVE | Create mandatory implementation and staging defects ahead of optional growth work |

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

## Claim blockers

None recorded.

## Page and translation blockers

| URL | Status | Claim refs | Translation | Owner decision |
| --- | --- | --- | --- | --- |
| https://dpflab.ee/ | DRAFT | C-001\|C-002\|C-003\|C-004\|C-005\|C-006\|C-007\|C-008\|C-009 |  | APPROVED_CURRENT_SITE_FACTS; CONTENT_REVIEW_PENDING |
| https://dpflab.ee/et | DRAFT | C-001\|C-002\|C-003\|C-004\|C-005\|C-006\|C-007\|C-008\|C-009 | PENDING_REVIEW |  |
| https://dpflab.ee/en | DRAFT | C-001\|C-002\|C-003\|C-004\|C-005\|C-006\|C-007\|C-008\|C-009 | PENDING_REVIEW |  |
| https://dpflab.ee/privacy | DRAFT | C-008\|C-009 |  | LEGAL_REVIEW_PENDING |
| https://dpflab.ee/et/privacy | DRAFT | C-008\|C-009 | PENDING_REVIEW |  |
| https://dpflab.ee/en/privacy | DRAFT | C-008\|C-009 | PENDING_REVIEW |  |

## Launch monitoring

| Check | Signal | Threshold | Cadence | Owner | Rollback | Status |
| --- | --- | --- | --- | --- | --- | --- |
| M-001 | public_route_status | Any critical route non-200 or wrong locale | daily for 7 days after 2026-08-11 launch | Egor | Rollback Worker to 85eea6aa; preserve D1 | PRODUCTION_PASS |
| M-002 | persisted_website_lead | Every accepted form creates exactly one complete row; invalid/duplicate scenarios match spec | after launch and after form changes | Egor | Disable affected campaign destination or revert Worker | PASS_WITH_RECORDED_RISK |
| M-003 | admin_access_and_tasks | Unauthorized request denied and authorized operator can complete critical tasks | after launch and after access/config change | Egor | Revert access/Worker config | PASS_WITH_RECORDED_RISK |
| M-004 | meta_instant_lead_ingestion | Signed test lead creates one row; duplicate creates none; failure is retryable/visible | before enablement and daily diagnostics | Egor | Unsubscribe webhook or disable integration; retain platform lead export | BLOCKED |
| M-005 | paid_job_and_expense_reconciliation | No unexplained difference against payment/accounting record beyond owner-set tolerance | weekly | Luka/Danik | Stop using dashboard as financial truth and reconcile source rows | BLOCKED |
| M-006 | outbox_liveness | No event beyond retry/lease threshold; dead/skipped reasons visible | daily after provider enablement | Egor | Disable provider events while preserving CRM truth | BLOCKED |
| M-007 | search_and_ad_destinations | No valuable owner/final URL lost and no irrelevant redirect | weekly for 8 weeks | Egor | Rollback routes/redirects and restore prior owners | PASS_WITH_RECORDED_RISK |
