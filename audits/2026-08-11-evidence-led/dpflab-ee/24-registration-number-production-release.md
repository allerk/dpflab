# Registration-number production release — 2026-08-11

## Authority and scope

Egor explicitly instructed that the verified registration-number change be released to the working site. The release changed the website Worker and static assets only. It did not attach a Meta form to an ad, change a campaign or budget, enable Google, or apply a D1 migration.

## Released artifact and rollback

- Git implementation commit: `153c540` (`feat: qualify leads by registration number`).
- Evidence commit at build time: `410f4f4`.
- Cloudflare Worker: `dpflab`.
- Production version: `2f98b126-55cd-408c-af80-1633953528aa`.
- Previous Worker rollback version: `e72d063a-3bf6-4f4c-b3c2-3411266def70`.
- Pre-release production D1 Time Travel bookmark: `000009e9-00000000-000050c4-561defb9f98ef36822455ff30f799a9a`.

A new local full SQL export was not made because it would duplicate production personal data outside Cloudflare. No database migration was needed: `registration_number` already existed and Wrangler reported no pending production migrations. The release did not write to D1.

## Production verification

- `npm run check`: 0 errors and 0 warnings.
- Vitest: 28 files / 134 tests passed.
- Cloudflare production build and deployment: pass; 33 changed static assets uploaded.
- Plain `/`, `/et` and `/en` returned HTTP 200 and the RU, ET and EN registration-number labels from the new artifact.
- RU, ET and EN privacy routes returned HTTP 200 and disclosed the registration-number field and its qualification purpose.
- Bundled Chromium at 390 × 844 passed visible-card interaction, step flow, localized help, required-field error, error focus, correction-state clearing and normalization to `123 ABC`; it submitted no valid production lead.
- An enhanced same-origin incomplete action returned a SvelteKit failure with internal status `422` inside the expected HTTP `200` action envelope.
- Production `contact_submissions` stayed `22 -> 22`; legacy rows with non-empty `registration_number` remained `0`, as expected before the first new qualified lead.
- Unauthenticated `/admin/submissions` still redirected to Cloudflare Access.
- A read-only scan checked both current Meta ads; none references the new RU, ET or EN form ID. No ad or spend mutation occurred.

## Recorded risks and next boundary

- No valid production lead was sent because that would notify the operating team. Persistence of the same action path was verified locally; the production invalid path verified no unwanted row.
- Authenticated CRM completion, a signed Meta webhook and provider delivery remain separate blocked scenarios.
- The ET Meta candidate contains Estonian custom copy but uses Meta's `EN_GB` provider locale fallback; Meta-owned standard labels may remain English and require Forms Library review before attachment.
- Production is frozen on `2f98b126-55cd-408c-af80-1633953528aa`. Roll back code to `e72d063a-3bf6-4f4c-b3c2-3411266def70` if the registration flow regresses. D1 restore is not required for a code-only rollback because this release made no D1 writes or schema changes.
