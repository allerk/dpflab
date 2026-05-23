---
name: team-lead-context
description: Session-learned context for the team-lead agent (architect, orchestrator, solo fallback)
metadata:
  type: project
  agent: team-lead
---

## Session 1 — 2026-05-23 16:12 UTC

[LEARNED] Full `dpflab-agents` team lifecycle tested and confirmed working:
`TeamCreate` → spawn homelander + black-noir → `SendMessage` task → report received → memory written → `shutdown_request` → `shutdown_approved` → `TeamDelete`. No issues.

[DECISION] Shutdown protocol: use `/end:shutdown` skill (sends `shutdown_request` to all agents, then `TeamDelete`). Do not send shutdown messages manually — the skill also flushes memory and calls `TeamDelete`.

[WARNING] Admin panel has several security gaps found by black-noir. Not fixed — out of scope for this session. Key issues:
- 4 routes skip `requireAdmin` (images, site-images, before-after list, before-after detail)
- Session `iat` never validated server-side — replayable for full 7-day cookie window
- Image upload silently overwrites existing files without collision check
- `before-after` reorder actions pass NaN to repository (no guard)
- `IMAGES_DIR` constant duplicated in two files
- No brute-force protection on login

Full details in `.claude/memory/agents/black-noir.md`.

## Session 2 — 2026-05-23 19:49 UTC

[WARNING] Startup checklist not executed at session open: team-lead.md and scratch.md were not read until user prompted. Root cause: CLAUDE.md instruction was buried mid-file. Fixed by moving a mandatory startup block to the very top of CLAUDE.md.
