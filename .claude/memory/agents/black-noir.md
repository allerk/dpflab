---
name: black-noir-context
description: Session-learned context for the black-noir PR reviewer agent
metadata:
  type: agent-specific
  agent: black-noir
---

## Session 1 — 2026-05-23 16:12 UTC

[INFRA] GitHub self-approval is blocked when PR author and reviewer share the same `allerk` account. Future PRs opened by homelander under this account will always use `--comment` with explicit verdict wording. Consider a dedicated reviewer GitHub account if a formal approval workflow is required.

[LEARNED] `hooks.server.ts:adminGuardHandle` (lines 20–63) is the **single primary auth boundary** covering ALL `/admin/*` routes (GET + POST). Individual `requireAdmin()` calls in load/actions are secondary defense-in-depth only — the hook runs before `resolve(event)`.

[WARNING] 4 admin pages/actions currently **skip `requireAdmin`** (inconsistent with all other pages):
- `src/routes/admin/(protected)/images/+page.server.ts` — actions `upload` (line 18) and `delete` (line 37)
- `src/routes/admin/(protected)/site-images/+page.server.ts` — `load` (line 7) and action `save` (line 13)
- `src/routes/admin/(protected)/before-after/+page.server.ts` — `load` (line 12) and all actions (lines 18–45)
- `src/routes/admin/(protected)/before-after/[id]/+page.server.ts` — `load` (line 7) and `default` action (line 16)

[WARNING] Session `iat` (issued-at) is stored in token payload (`src/lib/server/admin/session.ts:6`) but **never validated server-side** — only cookie `maxAge: 60*60*24*7` governs expiry. A token extracted from logs is replayable for the full 7-day window.

[WARNING] `IMAGES_DIR` constant is **defined in two places** independently:
- `src/lib/server/admin/images.ts:4`
- `src/routes/admin/(protected)/images/+page.server.ts:10`
Split-brain risk if one copy diverges.

[LEARNED] Dashboard home page (`src/routes/admin/(protected)/+page.svelte`) is **missing the "Site Images" section card** — all other sections are present there and in the sidebar.

[LEARNED] Test baseline as of Session 1: `npm run check` → 0 errors, `npm test` → 47 passed (11 files).
