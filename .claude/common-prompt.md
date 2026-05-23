---
name: common standards
description: project common standards that applies to all agents.
---

## Communication Rule

Every message you send via SendMessage must be prepended with the current timestamp in `[YYYY-MM-DD HH:MM UTC]` format. Get the current time by running: `date -u '+%Y-%m-%d %H:%M'` before sending any message.

MANDATORY: After completing each task, send a SendMessage report to the team lead. Do not go idle without reporting.

**REQUIREMENT ACKNOWLEDGMENT:** When you receive a message containing new requirements or instructions, acknowledge EACH item explicitly before beginning work. If you are already mid-task and new requirements arrive, pause to acknowledge them — do not silently absorb or ignore items. Multi-part messages must receive multi-part acknowledgments.

## Language Rules

- **Framework docs:** English
- **User communication:** English and Russian

## Agent Spawning Rule

Agents MUST be spawned with `run_in_background: true`.

When two or more specialists work on the same git repository in parallel — different feature branches on the SAME local clone — use `git worktree add` to give each specialist a separate physical working directory. The shared working tree silently corrupts parallel work: Specialist A's uncommitted changes block Specialist B's branch switch; stash hides work and risks abandonment; force-switch produces silent data loss; sequential handoff serializes work. Worktree isolation is the third path — keep parallel work parallel without shared-state contention. The pattern applies when three joint conditions hold: multiple parallel specialists + shared local clone + branch overlap incidental-not-intentional. **Recovery primitive when working tree appears to show "lost" work:** if a system-reminder or tool claims a file was externally modified but you didn't modify it, run `git status` + `git branch --show-current` BEFORE re-Editing — the most likely cause is another specialist switched branches. `git show origin/<your-branch>:<your-file>` confirms whether origin truth differs from working-tree view. Worktree-isolation discipline is **scoped to git workflows**; the harness inbox-write layer is a separate substrate with a separate failure mode (see `worktree-spawn-asymmetry-message-delivery` and `substrate-invariant-mismatch` Instance 6) — worktree-isolation works for git but does not fix harness-inbox cross-boundary delivery. Cataloged at [`wiki/patterns/worktree-isolation-for-parallel-agents.md`](teams/framework-research/wiki/patterns/worktree-isolation-for-parallel-agents.md).

## Scratch Rule

Agents write in-session findings to `.claude/scratch.md` — **never directly to `.claude/memory/`**. Memory files are only written at `/shutdown` (distillation) or via explicit `/save-project-memory` (developer-confirmed bypass).

### What to write to scratch (mandatory categories)

| Category | Write when |
|----------|------------|
| Security gap | Missing auth check, replay risk, exposed secret, unvalidated input at a boundary |
| Split-brain | Same constant, type, or config defined in two or more places independently |
| Undocumented invariant | Architectural fact absent from or contradicting `CLAUDE.md` |
| Missing UI element | A page/section/card that exists everywhere else in the pattern but is absent here |
| Test baseline change | `npm test` result changed (pass count, file count, or new failures) |
| Deferred item | Something intentionally skipped that must be revisited |

Do not write: style opinions, minor naming issues, facts already in `CLAUDE.md`.

### Scratch entry format

Run `date -u '+%Y-%m-%d %H:%M'` (UTC) before appending. Then append to `.claude/scratch.md`:

```
<!-- agent: <name> | task: <short desc> | YYYY-MM-DD HH:MM -->
[TAG] fact here
```

### Idempotency — deduplication check

Before appending to scratch, compare the item against the existing scratch content AND `.claude/memory/agents/<agent-name>.md`. If an equivalent fact is already recorded — same file, same issue, same invariant — **skip it**.

This ensures: same codebase + same task = same scratch entries, not a random subset each time.

## Memory Write Rules

These rules apply to every write to `.claude/memory/`, regardless of how it was triggered (command, report, direct instruction).

**Tags** — every entry must begin with one:
- `[DECISION]` — a resolved choice (architecture, tooling, convention)
- `[LEARNED]` — a fact discovered during a session
- `[WARNING]` — a known pitfall or constraint to watch out for
- `[WIP]` — something in progress, not yet resolved
- `[DEFERRED]` — intentionally postponed, revisit later

**Write mechanics:**
1. Write to the correct file (`agents/<name>.md`, `team-lead.md`, or `<topic>.md`)
2. Update `.claude/memory/MEMORY.md` index — one line per file: `- [Title](file.md) — hook (≤ 150 chars)`
3. State the exact file path written in your response — no silent writes

**Ambiguous scope** (project vs. personal memory) — stop and ask, name both tiers explicitly. Do not guess.

**Unconfirmed saves** — if the developer says "don't care", proceed but prepend:
```
> ⚠ SPECULATIVE — tier/path chosen by agent without explicit developer confirmation. Review and move/delete if incorrect.
```

**Security** — never write secrets, credentials, or PII to `.claude/memory/` — it is committed to git.

## Git & GitHub Rules

Full conventions in `.claude/docs/git-conventions.md`. Key non-negotiables for all agents:

- **Conventional Commits** — every commit message: `<type>: <short description>` (feat, fix, refactor, test, docs, chore, style)
- **Branch naming** — `<type>/<kebab-description>` (e.g. `feat/new-agent-wizard`)
- **Protected branches** — `main` and `develop` are protected; never commit directly. Always open a PR targeting `develop` via `gh pr create --base develop`
- **black-noir review** — every PR must be reviewed by black-noir before merge
  - Team mode: `SendMessage to black-noir: "Review PR #<number> — <description>"`
  - Solo mode: `Agent(subagent_type="black-noir", prompt="Review PR #<number>...")`
- **No Co-authored-by** — never add `Co-Authored-By: Claude` or any AI co-author line to commits
- **GitHub CLI** — use `gh` for all GitHub operations (PRs, reviews, checks); credentials are configured

## Fallback, implicitness and inconsistency

If you or the agents are doing something that isn't looking as our requirements. Do not write fallback logic `just to pass`
the requirements. Instead, mark it as `speculative`
