# DPFLAB production release — 2026-08-11

## Released artifact

- Git commit: `ca54958fd49e37d49ad6d797e2a72551daa03d0b`
- Cloudflare Worker: `dpflab`
- Production version: `e72d063a-3bf6-4f4c-b3c2-3411266def70`
- Previous Worker rollback version: `85eea6aa-178d-48ae-8983-cd5bfa965353`
- Public hostname binding: `dpflab.ee` -> service `dpflab`, environment `production`

The production build completed and 36 changed static assets were uploaded. The
custom domain was already bound correctly. Cloudflare retained old HTML in the
Worker Cache API after deployment, so only the six public HTML cache keys were
purged: `/`, `/et`, `/en`, and their privacy variants. D1 and R2 were not purged.

## Data safety and migrations

- Pre-release production D1 export:
  `/Users/egorstupin/Developer/dpf_lab/backups/dpflab-prod-pre-growth-2026-08-11.sql`
- Export size: `30,365` bytes; local mode: `600`.
- Applied migrations: `0008_crm_foundation.sql`,
  `0009_marketing_metric_currency.sql`,
  `0010_dpf_operations_and_expenses.sql`.
- Post-migration status: no migrations pending.
- Verified tables: `contact_submissions`, `business_expenses`, `lead_activities`,
  `delivery_outbox`, `marketing_daily_metrics`.
- Existing production submissions after migration: `22`.

## Production smoke evidence

- All RU/ET/EN landing and privacy routes returned HTTP 200.
- All three landing routes served the released CSS asset
  `0.CCw5W3Vm.css`, proving the new artifact was live after cache purge.
- Document language, canonical and reciprocal RU/ET/EN/x-default alternates were
  correct; JSON-LD parsed as an `AutomotiveBusiness` object rather than the old
  literal placeholder.
- Browser smoke at 1280 px: no document-level horizontal overflow, all four
  published images loaded, and no console warning/error was recorded.
- Static hero and a representative R2 image returned HTTP 200.
- Unauthenticated `/admin/submissions` redirected to Cloudflare Access.
- Meta Lead Ads webhook with an invalid token returned `503` with `no-store`
  because its production secrets are intentionally not configured; the feature
  remains disabled.
- A same-origin invalid public form request returned SvelteKit action failure
  status `422`; production submissions stayed `22 -> 22`.
- A fully valid fake lead was exercised locally against the same server action
  with notifications unavailable, producing local `site-lead-4`. No valid fake
  lead was sent on production because it would notify the operating team.

## Rollback

If a Worker regression is found, restore Worker version
`85eea6aa-178d-48ae-8983-cd5bfa965353`. The schema changes are additive; if a
data rollback is required, use the pre-release D1 export above and stop writes
before restoration. Do not delete the production backup until the owners accept
the release and the first monitoring window is complete.

## Recorded limitations

- The in-app browser viewport override remained at 1280 px during this final
  production run. Mobile 390 px evidence comes from the same artifact on develop;
  it is not relabelled as a production mobile run.
- Authenticated CRM task completion, accepted-then-revoked provider consent, a
  real signed Meta lead, and provider delivery remain not verified.
- Meta and Google CRM event delivery flags remain disabled. Meta Lead Ads webhook
  secrets are not configured. These disabled paths are not presented as live.
- No PageSpeed or field Core Web Vitals result is claimed.

## Next mutation boundary

Production is frozen on version `e72d063a-3bf6-4f4c-b3c2-3411266def70`.
Subsequent design, content, SEO, CRM or measurement changes must be implemented
and verified on develop first, then receive a new explicit production decision.
The evidence-led validator still keeps G8/G9/G10 blocked because prerequisite
URL/content decisions and the full authenticated/provider staging matrix are not
complete. This release is therefore recorded as an explicit delegated-operator
override, not as evidence that those gates passed.
