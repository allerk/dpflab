# dpflab-ee — evidence-led website project

- Schema: `3`
- Audience contract: `1`
- Mode: `REBUILD`
- Depth: `CONTROLLED_MIGRATION`
- Entry point: `FULL`
- Primary profile: `LOCAL_OPERATIONAL_SERVICE`
- Markets: `Estonia; current public service scope and partner-facing statements are owner-confirmed`
- Languages: `ru|et|en`
- Authorized systems: `repository; Cloudflare develop Worker/D1/R2; two explicitly approved 2026-08-11 production Worker releases; Meta configuration plus new RU/ET/EN Instant Form review candidates`
- Mutation boundary: `Production registration-number release 2f98b126 is complete and frozen; Meta authority remains limited to reviewable v2 forms without attaching them to ads or changing spend; provider enablement and another production release require a new explicit owner decision`
- Commercial outcome chain: `visit/ad touch -> persisted lead -> contacted -> diagnostics/partner route -> qualified -> price confirmed -> booked -> filter received -> cleaning -> ready -> paid/completed -> business expenses -> operating contribution`
- Current gate: `G11`
- Owner: `Egor as delegated technical operator; Luka and Danik remain business/claims/launch owners`

## Scope

Apply the evidence-led workflow to the existing multilingual DPFLAB service site and its lead-to-CRM path. Preserve current production routes, advertising destinations, lead persistence, Cloudflare data, and rollback ability while identifying defects and deciding what the site may safely promise.

Current exclusions: no further production mutation after release 2f98b126, no Meta form ad attachment, no advertising spend or campaign mutation, no invented reviews/cases/guarantees/results, no Google activation, no files attached to CRM expenses, and no use of provider lead counts as commercial truth.

## Source map

Use `01-source-register.csv`. Preserve raw evidence outside this decision pack.

## Stop condition

Production version `2f98b126-55cd-408c-af80-1633953528aa` is frozen after the explicit registration-number release decision, rollback capture and production smoke. The next cycle returns to reversible develop-only work; another production change requires a new G9/G10 decision. Structural URL expansion remains blocked by G1/G4 even though current public facts are approved.

## Routing policy

The selected Mode, Depth, and Entry point must satisfy `references/routing-contracts.csv`.
`04-method-plan.csv` is the canonical method stack; JSON is a standalone exchange adapter only.
