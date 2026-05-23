---
name: pr-review
description: Review a pull request or pending branch changes against this project's conventions. Use when the user asks to review a PR, audit a diff, or check a branch before merge. Triggers on mentions of PR review, code review, "look over this branch", or a GitHub PR URL/number.
---

# PR Review

Review the current branch's diff against `main` (or a specified PR via `gh pr view <num>`).

## Workflow

1. Identify scope: `git diff main...HEAD --stat` and `git log main..HEAD --oneline`. If the user named a PR, `gh pr view <num> --json title,body,files`.
2. Read the full diff (`git diff main...HEAD`) before commenting — partial reads cause incorrect calls about consistency.
3. Run the project checks the change would have to pass anyway: `npm run check` and `npm test`. Report failures concretely.
4. Group findings by severity: **blockers** (correctness, security, lost data, broken types) → **should-fix** (convention drift, missing tests, perf footguns) → **nits** (naming, comments).

## Project-specific checks

**Database changes ([[database]]):**
- Schema edit landed in `src/lib/db/schema.ts`? Then `drizzle/` migration must exist in the same commit.
- Repository functions take `db: Db` as first param (testable).
- Translatable text columns use `makeLangStr` / `getLang`, not separate locale columns.
- Deletes that touch `sortOrder` re-sequence remaining rows.

**SvelteKit changes ([[svelte-kit]]):**
- Locale read from `event.locals.locale`, not URL parsing.
- Paraglide messages imported by name, never as `* as m`.
- No edits inside `src/lib/paraglide/` (generated).
- Locale switch uses `window.location.href` (full reload), not `goto`.
- New content tables are queried inside the `Promise.all` in `+page.server.ts`.

**Styling changes ([[styling]]):**
- Custom CSS is wrapped in `@layer base` or `@layer components` — un-layered CSS silently overrides Tailwind utilities.
- New design tokens added to `@theme`, not hardcoded hex/px in components.
- Breakpoint usage matches the project's `xs/sm/md/lg/xl` semantics (480/600/900/1060/1180).

**Tests ([[tdd]]):**
- New repository or server logic ships with vitest coverage using `createTestDb()`.
- No DB mocking. No mocking of generated Paraglide messages.
- Test names describe behavior, not function calls.

## Output format

Open with a one-line verdict (ship / changes-requested / needs-discussion). Then findings as a bullet list, file:line for each, severity-tagged. Skip the "what changed" recap — the user has the diff.
