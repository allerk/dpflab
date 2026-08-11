# dpflab-ee — evidence-led website project

- Schema: `3`
- Audience contract: `1`
- Mode: `REBUILD`
- Depth: `CONTROLLED_MIGRATION`
- Entry point: `FULL`
- Primary profile: `LOCAL_OPERATIONAL_SERVICE`
- Markets: `Estonia; current public service scope and partner-facing statements are owner-confirmed`
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

The current cycle may implement and test reversible code changes on develop. Production remains blocked until the complete G9 staging matrix, rollback evidence and an explicit G10 production decision exist. Structural URL expansion remains blocked by G1/G4 even though current public facts are approved.

## Routing policy

The selected Mode, Depth, and Entry point must satisfy `references/routing-contracts.csv`.
`04-method-plan.csv` is the canonical method stack; JSON is a standalone exchange adapter only.
