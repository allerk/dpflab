# CRM deployment checklist

No production mutation is performed by the repository itself. Deploy in this order:

1. Apply D1 migrations `0008` and `0009` to `develop` and take a D1 backup/export first.
2. Deploy the main Worker to `develop`; keep all outbound launch gates `false`.
3. Set main-Worker secrets: Meta webhook/app/token values, marketing token, CAPI token, Google MP secrets and a random `CRM_CRON_TOKEN` of at least 32 characters.
4. Set the same `CRM_CRON_TOKEN` on `dpflab-crm-cron-develop`, then deploy it with `npm run deploy:crm-cron:develop`.
5. Test one RU, ET and EN Meta lead, duplicate delivery, manual/WhatsApp lead, next action, completed job, mixed-currency guard and a forced outbox retry.
6. Validate Meta events in Test Events and Google events with the MP validation endpoint/DebugView. Develop must use a separate Meta test dataset.
7. Repeat backup, migrations, main deploy, secrets and cron deploy for `prod`.
8. Enable only the approved gates: `META_CRM_EVENTS_ENABLED`, `META_SITE_CRM_EVENTS_ENABLED`, `GOOGLE_CRM_EVENTS_ENABLED`. Site CRM lifecycle gates remain off without server-side consent-revocation synchronization.

Required main-Worker secrets:

- `META_APP_SECRET`, `META_LEADS_ACCESS_TOKEN`, `META_LEADS_VERIFY_TOKEN`;
- `META_MARKETING_ACCESS_TOKEN`, `META_CAPI_TOKEN`;
- `GOOGLE_ANALYTICS_API_SECRET`, `GOOGLE_ANALYTICS_PSEUDONYM_KEY`;
- `CRM_CRON_TOKEN`.

Required public configuration includes the Meta Page/form/ad-account IDs already present in `wrangler.jsonc`, plus `GOOGLE_ANALYTICS_MEASUREMENT_ID` when the GA4 property exists. Google Ads offline delivery still requires real OAuth, customer and conversion-action identifiers; the repository currently contains only its validated preparation boundary.

Rollback: switch all outbound gates to `false`, disable the cron trigger, and redeploy the previous main Worker. The additive D1 columns/tables can remain in place; do not down-migrate live lead data during an application rollback.
