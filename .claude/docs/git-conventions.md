# Git & PR Conventions

## Commit messages — Conventional Commits

Format: `<type>: <short description>`

| Type | When |
|------|------|
| `feat` | new feature |
| `fix` | bug fix |
| `refactor` | code change with no behaviour change |
| `test` | adding or updating tests |
| `docs` | documentation only |
| `chore` | maintenance, deps, config |
| `style` | formatting, whitespace |

Examples:
```
feat: add scratchpad distillation on shutdown
fix: ensure IMAGES_DIR imported from shared module
refactor: split CLAUDE.md into focused doc files
```

**Never add `Co-Authored-By: Claude` or any AI co-author line to commits.**

## Branch naming

Pattern: `<type>/<kebab-description>`

Examples: `feat/new-agent-wizard`, `fix/utc-timestamps`, `chore/docker-setup`

## Protected branches and promotion path

Code reaches `main` only via `develop`. The full path is:

```
feature branch → PR → develop → PR → main
```

`main` and `develop` are protected — direct commits are **blocked by GitHub**. Do not attempt to push directly; you will be rejected. Work on a feature branch instead.

**Workflow for every task:**
1. Create a feature branch from `develop`: `git checkout -b <type>/<kebab-description> develop`
2. Do the work, commit incrementally
3. Push the branch: `git push -u origin <branch>`
4. Open a PR targeting `develop` via GitHub CLI:
   ```bash
   gh pr create --base develop --title "<type>: <description>" --body "..."
   ```
5. Request black-noir review (see below)

**Never** use `git push --force` on shared branches. **Never** skip hooks (`--no-verify`).

## Branch granularity — one branch per task, not per sub-task

Create **one branch per logical task**. If a task naturally has sub-tasks (e.g. building three input variants — phone, text, date), keep all sub-tasks on the same branch. Do not split into three branches.

**Rule of thumb:** if the sub-tasks ship together and reviewing them separately adds no value, they belong on one branch.

**Exception:** if a sub-task is genuinely independent and could be reviewed and merged separately without the rest, it may get its own branch.

_Future: when GitHub Issues or a ticket tracker is connected, one branch will map to one ticket. Until then, use your judgment on task boundaries._

## Code review — black-noir

Every PR must be reviewed by black-noir before merge.

**In agent-team mode:**
```
SendMessage to black-noir: "Review PR #<number> — <brief description>"
```

**In solo or sub-agent mode:**
Spawn black-noir as a sub-agent:
```
Agent(subagent_type="black-noir", prompt="Review PR #<number> at <repo>. Post verdict via gh pr review.")
```

black-noir posts the verdict directly to GitHub via `gh pr review <num>`.

## GitHub CLI

Use `gh` for all GitHub interactions — creating PRs, posting reviews, listing checks:
```bash
gh pr create     # open PR
gh pr review     # post review verdict
gh pr merge      # merge after approval
gh pr status     # check CI status
```

Credentials are already configured on this machine.
