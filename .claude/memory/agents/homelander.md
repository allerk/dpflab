---
name: homelander-context
description: Session-learned context for the homelander full-stack dev agent
metadata:
  type: agent-specific
  agent: homelander
---

## Session 1 — 2026-05-23 16:12 UTC

[DEFERRED] `admin_contacts_whatsapp` i18n key is still present in `messages/ru.json` and `messages/et.json`, and the admin contacts form still exposes a WhatsApp URL editing field (`src/routes/admin/(protected)/contacts/`). Public site no longer renders this URL anywhere after PR #8. Decision needed: remove the admin field + key entirely, or leave dormant for potential future re-use.

[WARNING] `IMAGES_DIR` constant duplicated in `src/lib/server/admin/images.ts:4` AND `src/routes/admin/(protected)/images/+page.server.ts:10` — not imported from shared source; split-brain risk if path changes.

[LEARNED] Auth for admin form actions is enforced by `adminGuardHandle` in `hooks.server.ts` (runs before every `/admin/*` request), NOT by layout load. Layout `requireAdmin()` only gates page loads. Pattern is inconsistent across protected routes — some pages call `requireAdmin()` in actions, some don't — but the hook provides the real protection.

[LEARNED] Scratchpad system wired correctly — agents write to `.claude/scratch.md`, team-lead distills at shutdown.
