# DPFLAB CRM architecture

## Product boundary

The site admin is the operational source of truth for every enquiry and paid job. Meta Leads Center remains a native backup inbox; Meta Ads Manager and Google Ads remain advertising consoles. Staff must not update the same pipeline in two products.

The primary users are the three people operating a new DPF cleaning workshop. The CRM's single job is to make the next customer action and the gross result of each job obvious on a phone or desktop.

## Pipeline

`new -> contacted -> qualified -> booked -> completed`

`lost` is an explicit terminal branch and requires a reason. Milestone timestamps are retained even if a lead moves backwards so funnel reporting reflects what actually happened.

## Lead origins

- `site`: website form with UTM, Meta click and Google click identifiers.
- `meta_instant`: Meta Instant Form webhook with Page, form, campaign, ad set and ad identifiers.
- `whatsapp`: future WhatsApp Business webhook or manual conversation-to-lead action.
- `manual`: phone, referral, walk-in or staff-created lead.

Provider/external-lead identifiers are idempotency keys. Contact normalization supports duplicate warnings, but does not silently merge people.

## Financial model

Each completed job stores:

- charged amount (revenue);
- parts/materials;
- labour;
- logistics;
- other direct cost.

`gross profit = revenue - direct costs`

`gross margin = gross profit / revenue`

Advertising ROAS and business ROI remain separate metrics. Daily marketing spend is stored locally by provider/campaign so dashboards never depend on a live advertising API request.

## Delivery model

After a successful pipeline update, the same request writes idempotent outbox rows before starting provider network calls. Connectors record attempts/errors, and admin actions can retry failed deliveries. The business mutation and enqueue are not one D1 transaction; a separate scheduled Worker therefore reconciles recent milestone timestamps every 15 minutes, recreates missing idempotent rows, recovers expired processing leases and drains due retries. Secrets never enter D1, logs or client data.

Planned outbound signals:

- lead created;
- qualified lead;
- booking/schedule;
- completed purchase with EUR value;
- lost lead for internal reporting only unless a provider explicitly supports it.

Meta Instant Form retrieval and downstream CRM events are separate integrations. GA4 Measurement Protocol and Google Ads offline/enhanced conversions are also separate; the latter requires Google Ads OAuth, customer/conversion-action identifiers and click identifiers.

## Interface direction

The visual language is a workshop dispatch board, not a generic SaaS dashboard.

- Palette: carbon `#0e0e0e`, steel `#1c1c1c`, line `#2a2a2a`, DPFLAB lime `#7ed321`, action amber `#f4b942`, information blue `#5da9e9`, loss red `#ef5b5b`.
- Typography: the existing heavy system sans for operational labels and headings; tabular monospace for identifiers, dates and money.
- Layout: a compact pipeline rail, searchable job ledger, and a detail view split into customer/task, next action, financial ledger, attribution and activity history.
- Signature: a horizontal job-result ruler that makes revenue, direct cost and gross profit readable without opening a separate report.

The earlier concept used interchangeable metric cards. It was rejected because it would look like any analytics template. The revised ledger/dispatch-board structure encodes the workshop workflow and gives overdue work priority over decorative totals.

## Operational safeguards

- Cloudflare Access protects every admin route.
- Webhooks verify provider signatures before reading payloads.
- PII is never written to application logs.
- The operational list is capped at the latest 200 leads and visibly warns at the cap. The 30-day cohort report uses a separate period query (with a visible 5000-row safety sentinel), so the UI page cap cannot silently change ROI. Add cursor pagination and SQL-only CRM aggregates before either limit is approached.
- Paid Meta revenue requires a paid marker, campaign/ad ID or click ID. Organic and unattributed Meta leads are reported separately and never silently charged against Ads spend.
- Completed financials are immutable in the current UI because a later local edit would diverge from already emitted conversion value. A future correction workflow must version and reconcile provider adjustments.
- D1 stores structured records and R2 stores future files/photos.
- Deletion requires an explicit confirmation and writes only the numeric record ID to Worker logs; it is not yet a durable audit record because lead activities cascade with the deleted lead. Routine workflow should use status changes instead.
- Personal-data export/retention policy is required before WhatsApp or document uploads are enabled.
