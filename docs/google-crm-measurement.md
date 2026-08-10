# Google CRM measurement connector

This connector is wired to the CRM delivery outbox for consented GA4 lifecycle events and prepares
a later Google Ads offline-conversion integration. It contains no credentials; routes enqueue only
opaque stage records and the server reloads the lead when a delivery is claimed.

## What is implemented

`src/lib/server/analytics/google-ga4.ts` sends privacy-limited GA4 Measurement Protocol events:

| CRM stage | GA4 event | Notes |
| --- | --- | --- |
| `lead_created` | `generate_lead` | Includes `lead_source` when known. |
| `qualified` | `qualify_lead` | Can include an estimated value and currency. |
| `booked` | `working_lead` | Includes `lead_status=booked`. |
| `completed` | `close_convert_lead` | Includes the completed job value when known. |
| `completed` with positive value and service type | `purchase` | Uses the outbox ID as `transaction_id` for deduplication. |

The module accepts no name, email, phone, IP address, or user-agent fields. It prefers a GA
`client_id` and `session_id` captured by Google tag/GTM. If no client ID exists (for example,
a Meta Instant Form lead), it can derive a stable HMAC pseudonym from an opaque CRM key. The raw
CRM key is never sent to Google.

`src/lib/server/analytics/google-ads-offline.ts` is a pure preparation boundary for Google Ads.
It outputs a Data Manager API-compatible event, hashes consented email/phone identifiers with
SHA-256, carries `gclid`, `gbraid`, and `wbraid`, and never performs a network call. OAuth,
destinations, and conversion action IDs remain deliberately outside this module.

The website form now persists `gclid`, `gbraid`, `wbraid` and a GA client identifier only after analytics consent. Attribution localStorage is deleted on refusal/revocation and the server discards submitted advertising fields when consent is absent. A generic `_ga_*` session cookie is deliberately not persisted because it can belong to another property and late CRM stages are outside the original browser session. Manual and Meta Instant Form leads currently have analytics consent off,
so they do not enter the GA4 delivery queue by default.

## GA4 setup

Create a GA4 web data stream and a Measurement Protocol API secret under:

`Admin -> Data streams -> <web stream> -> Measurement Protocol API secrets`

Configure these Worker values:

| Variable | Secret | Required | Purpose |
| --- | --- | --- | --- |
| `GOOGLE_ANALYTICS_MEASUREMENT_ID` | No | Yes | Web stream ID such as `G-ABC12345`. |
| `GOOGLE_ANALYTICS_API_SECRET` | Yes | Yes | Measurement Protocol API secret. |
| `GOOGLE_ANALYTICS_PSEUDONYM_KEY` | Yes | For non-web leads | At least 32 random characters used as an HMAC key. |
| `GOOGLE_ANALYTICS_REGION` | No | No | Defaults to the EU `region1` endpoint; set `global` to use the global endpoint. |
| `GOOGLE_CRM_EVENTS_ENABLED` | No | Yes | Explicit `true` launch gate after privacy/consent and DebugView QA. |

Keep both secrets in Cloudflare Worker secrets, not `wrangler.jsonc` and not browser code.

Measurement Protocol supplements the browser Google tag; it does not replace it. When a valid
measurement ID is configured, the site loads `gtag.js` only after analytics consent, and the form
persists the resulting GA client ID. The connector does not promise session attribution for later CRM stages.
The connector refuses events older than 72 hours so an outbox can dead-letter them instead of
silently receiving a misleading timestamp.

## Generic outbox contract

Call `sendGoogleCrmEvent` with an immutable outbox ID and the time the CRM transition occurred.
Interpret the result as follows:

- `delivered`, `acknowledge=true`: mark the Google delivery complete.
- `skipped`, `acknowledge=true`: consent denied, invalid input, or outside Google's 72-hour window;
  store a separate `skipped` state with the reason and do not report it as delivered.
- `deferred`, `acknowledge=false`: credentials or an identifier are not configured yet; leave the
  event pending for a later setup or operator decision.
- `failed`, `retryable=true`: retry with exponential backoff.
- `failed`, `retryable=false`: dead-letter and alert; retries will not fix a 4xx response.

The transport never logs a request URL, response body, API secret, event payload, or exception
message. This avoids leaking secrets or customer data through Worker logs.

GA4's normal collection endpoint can return `2xx` even for an invalid payload. Before production,
validate representative payloads with Google's validation endpoint and verify them in DebugView.
The CRM should treat its own stage rows as commercial truth; raw GA event counts are at-least-once telemetry and can duplicate after an ambiguous network timeout.

## Google Ads pieces still required

As of August 2026, Google directs new offline-conversion integrations to the Data Manager API when
the Google Ads developer token had not already uploaded conversions before June 15, 2026. The
future delivery adapter should therefore target Data Manager API unless an existing eligible Ads
API integration is confirmed.

Before implementing delivery, obtain and configure:

1. A Google Cloud project with Data Manager API enabled.
2. OAuth credentials and a refresh token for a Google Account that can access the advertiser.
3. The Google Ads operating/login account IDs.
4. Enabled `UPLOAD_CLICKS` conversion action IDs for the stages to optimize, normally
   `qualified`, `booked`, and `completed`.
5. Accepted customer-data terms and enabled enhanced conversions for leads.
6. Granular consent records for measurement, ad user data, and ad personalization.
7. Persisted `gclid`, `gbraid`, and `wbraid` values, plus consented first-party email/phone data.
8. Optional encoded session attributes captured on the website for stronger attribution.

The Data Manager request adapter must map `conversionActionKey` to a real conversion action ID,
create the destination, add OAuth, send `encoding=HEX`, store the returned request ID, and surface
diagnostics. None of those values are guessed here.

## Official references

- [GA4 Measurement Protocol overview](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Send Measurement Protocol events](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events)
- [Measurement Protocol reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference)
- [GA4 recommended lead and purchase events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Measurement Protocol use cases and session attribution](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases)
- [Google Ads offline conversions](https://developers.google.com/google-ads/api/docs/conversions/upload-offline)
- [Data Manager API events overview](https://developers.google.com/data-manager/api/devguides/events)
- [Data Manager API event ingestion](https://developers.google.com/data-manager/api/devguides/events/send-events)
- [Upgrade Google Ads offline conversions to Data Manager API](https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/upgrade)
