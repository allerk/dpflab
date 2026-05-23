---
name: common standards
description: project common standards that applies to all agents.
---

## Communication Rule

Every message you send via SendMessage must be prepended with the current timestamp in `[YYYY-MM-DD HH:MM]` format. Get the current time by running: `date '+%Y-%m-%d %H:%M'` before sending any message.

MANDATORY: After completing each task, send a SendMessage report to the team lead. Do not go idle without reporting.

**REQUIREMENT ACKNOWLEDGMENT:** When you receive a message containing new requirements or instructions, acknowledge EACH item explicitly before beginning work. If you are already mid-task and new requirements arrive, pause to acknowledge them — do not silently absorb or ignore items. Multi-part messages must receive multi-part acknowledgments.

## Language Rules

- **Framework docs:** English
- **User communication:** English and Russian

## Agent Spawning Rule

Agents MUST be spawned with `run_in_background: true`.

When two or more specialists work on the same git repository in parallel — different feature branches on the SAME local clone — use `git worktree add` to give each specialist a separate physical working directory. The shared working tree silently corrupts parallel work: Specialist A's uncommitted changes block Specialist B's branch switch; stash hides work and risks abandonment; force-switch produces silent data loss; sequential handoff serializes work. Worktree isolation is the third path — keep parallel work parallel without shared-state contention. The pattern applies when three joint conditions hold: multiple parallel specialists + shared local clone + branch overlap incidental-not-intentional. **Recovery primitive when working tree appears to show "lost" work:** if a system-reminder or tool claims a file was externally modified but you didn't modify it, run `git status` + `git branch --show-current` BEFORE re-Editing — the most likely cause is another specialist switched branches. `git show origin/<your-branch>:<your-file>` confirms whether origin truth differs from working-tree view. Worktree-isolation discipline is **scoped to git workflows**; the harness inbox-write layer is a separate substrate with a separate failure mode (see `worktree-spawn-asymmetry-message-delivery` and `substrate-invariant-mismatch` Instance 6) — worktree-isolation works for git but does not fix harness-inbox cross-boundary delivery. Cataloged at [`wiki/patterns/worktree-isolation-for-parallel-agents.md`](teams/framework-research/wiki/patterns/worktree-isolation-for-parallel-agents.md).

## Fallback, implicitness and inconsistency

If you or the agents are doing something that isn't looking as our requirements. Do not write fallback logic `just to pass`
the requirements. Instead, mark it as `speculative`
