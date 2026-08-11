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
