---
name: homelander-context
description: Session-learned context for the homelander full-stack dev agent
metadata:
  type: agent-specific
  agent: homelander
---

## Scratchpad system test — 2026-05-23

[LEARNED] Scratchpad system wired correctly — agents write here, team-lead distills at shutdown.

## Admin images review — 2026-05-23

[WARNING] `IMAGES_DIR` constant duplicated in `src/lib/server/admin/images.ts:4` AND `src/routes/admin/(protected)/images/+page.server.ts:10` — not imported from shared source; split-brain risk if path changes.

[LEARNED] Auth for admin form actions is enforced by `adminGuardHandle` in `hooks.server.ts` (runs before every `/admin/*` request), NOT by layout load. Layout `requireAdmin()` only gates page loads. Pattern is inconsistent across protected routes — some pages call `requireAdmin()` in actions, some don't — but the hook provides the real protection.
