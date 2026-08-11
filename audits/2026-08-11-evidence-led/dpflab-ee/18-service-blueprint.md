# DPFLAB service blueprint

Status: `COMPLETE` for the current website/CRM design boundary. This is a heuristic operational model based on owner-confirmed current facts, implemented qualification fields and CRM stages. It does not prove demand or commercial uplift.

## Shared start and end states

- Start: a person or workshop suspects a DPF/FAP/catalyst problem, has a removed filter, or needs diagnosis.
- End: the request is either paid/completed, scheduled for follow-up, or closed with a recorded loss/spam reason.
- Primary public actions: qualification form, phone, WhatsApp and email.
- System of record: D1 `contact_submissions`; Meta Leads Center remains an upstream inbox, not the commercial source of truth.

## Scenario A — filter remains installed

| Layer | Sequence |
| --- | --- |
| Customer | Supplies the vehicle registration number, selects client context, service need, `installed`, symptoms, urgency and preferred contact; submits contact details. |
| Frontstage | DPFLAB uses the registration number to confirm the vehicle model/variant and check the applicable filter, explains that removal/installation is handled through a partner route, confirms the DPFLAB service price and coordinates the next step. |
| Backstage | Operator deduplicates the lead, records diagnosis/error context, selects a partner workshop, records whether the customer pays the partner directly, confirms price and booking. |
| Partner | Removes/installs the filter and charges the customer directly when `customer_direct` applies. This reference price is not a DPFLAB deal cost. |
| DPFLAB operation | Receives the filter, records diagnostic/pressure evidence where available, cleans it, marks it ready, returns it with the current report/result path and records paid completion. |
| CRM states | `new -> contacted -> diagnostics -> partner -> qualified -> quote_confirmed -> booked -> received -> cleaning -> ready -> completed`. |
| Recovery | Use `follow_up` when timing is deferred; `lost` with a reason when eligibility/price/timing fails; keep partner/contact/diagnostic notes and next action. |

## Scenario B — filter is already removed

| Layer | Sequence |
| --- | --- |
| Customer/workshop | Selects `removed`, supplies the vehicle registration number and service context, and chooses collection, delivery or consultation through the current contact path. |
| Frontstage | DPFLAB confirms eligibility, handoff, starting-price context and expected current turnaround. |
| Backstage | Operator records intake details, assigned owner, next action and confirmed DPFLAB price; no partner-removal expense is attached to the deal. |
| DPFLAB operation | Receives, diagnoses/tests, cleans, records before/after evidence where available, marks ready, returns and records paid completion. |
| CRM states | `new -> contacted -> diagnostics -> qualified -> quote_confirmed -> booked -> received -> cleaning -> ready -> completed`. |
| Recovery | Use `follow_up` for postponed handoff; `lost` for ineligible/damaged/no-agreement cases; preserve original source and reason. |

## Scenario C — workshop or repeat partner

| Layer | Sequence |
| --- | --- |
| Workshop | Sends an enquiry or filter with the vehicle registration number and expected handoff. |
| Frontstage | DPFLAB confirms eligibility, intake/return path, price responsibility and contact owner. |
| Backstage | Lead is marked `workshop`; partner workshop/contact and payment model are recorded. Multiple filters/jobs remain separate CRM submissions unless a future contract explicitly models batches. |
| Operation | Same `received -> cleaning -> ready -> completed` path; paid amount records DPFLAB revenue only. |
| Recovery | Record delayed partner/customer response as next action/follow-up; do not infer a completed job from filter delivery alone. |

## Scenario D — diagnosis, catalyst or uncertain request

| Layer | Sequence |
| --- | --- |
| Customer | Selects diagnosis/catalyst/other or `unsure` and describes symptoms. |
| Frontstage | DPFLAB clarifies whether the request belongs to the current service and which physical handoff is required. |
| Backstage | Store error codes, diagnostic notes, filter condition and the selected service type; do not silently coerce legacy blank services into DPF. |
| Outcome | Continue into A/B/C, set a dated follow-up, or close with a reason. |

## Website and form requirements

- Keep the first decision about filter location; it determines the partner/removal explanation.
- Require the vehicle registration number in every new website, manual CRM and Meta Instant Form lead; explain that it is used to confirm the model/variant, check the applicable filter and calculate a more accurate price.
- Preserve the legacy `vehicle` value for old leads and later lookup results; do not reinterpret an old free-text vehicle/part answer as a registration number.
- Normalize registration-number case and spacing without enforcing only the common `123 ABC` pattern; foreign and personalized plates may enter the same flow.
- Ask only fields that alter eligibility, handoff, service or follow-up.
- Keep phone/WhatsApp/email available without forcing the form, while attributing only persisted form/Meta leads as CRM leads.
- Show starting prices and the exact-price qualifier together.
- Preserve RU/ET/EN parity for steps, validation, privacy link and success/error states.
- Do not require cases, reviews or additional photographs to complete the primary task.

## Measurement requirements

- `lead_created`: a persisted unique CRM row, never a click or form step.
- Operational milestones use their first recorded timestamps; returning to `follow_up` must not erase paid completion.
- `completed`: paid/closed DPFLAB revenue with a locked amount; partner customer-direct price stays informational.
- General business expenses are period records, not allocations invented per filter.
- Meta/Google delivery state is diagnostic; D1 CRM plus payment/expense reconciliation remains commercial truth.

## Ownership and recovery

- Assigned DPFLAB operator owns contact, diagnosis, qualification, price, booking, intake, cleaning readiness and completion updates.
- Named partner workshop owns removal/installation when applicable.
- The CRM outbox/cron owns retry visibility; provider acknowledgement does not replace the CRM milestone.
- When any promise, coverage, price or language capability changes, reopen G5 and the affected page contracts before publishing.
