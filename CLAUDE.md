# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server (hot reload)
npm run build      # production build → build/
npm run check      # TypeScript + Svelte type-check (no separate lint step)
npm test           # run repository unit tests (vitest)
```

### Database

```bash
npm run db:generate   # generate a new migration file after schema changes
npm run db:migrate    # apply pending migrations to data/dpflab.db
npm run db:seed       # (re)seed all content tables from seed.ts — idempotent
```

Migrations run automatically on server startup via `src/lib/db/index.ts`. The `drizzle/` folder must be present in `process.cwd()` at runtime.

### Production

```bash
npm run build && node build/index.js   # PORT env var, default 3000
```

Node version pinned in `.nvmrc` (24.15.0).

## Agent Rules

Read `@.claude/common-prompt.md` on every startup — communication rules, memory write rules, and agent spawning conventions for all modes (solo, sub-agent, agent team).

**Git conventions:** read `.claude/docs/git-conventions.md` before any git or GitHub operation — Conventional Commits, branch naming, protected branches, black-noir PR review, no Co-authored-by.

## Architecture

Full details in `.claude/docs/architecture.md` — read it when working on any code changes.

Stack: SvelteKit + `@sveltejs/adapter-node` · Tailwind CSS v4 · Paraglide JS v2 + SQLite (hybrid i18n) · Drizzle ORM · Vitest.

## Project Memory

**Team-lead memory:** always load `.claude/memory/team-lead.md` on startup (all modes).

**Startup scratch check:** read `.claude/scratch.md` on startup. If non-empty, ask: distill now, carry forward, or discard?

**Full memory index** (`.claude/memory/MEMORY.md`) is loaded by `start-ai-team.md` in agent-team mode only.

To save a project-level fact: `/save-project-memory` or "save this to project memory: …". Rules in `.claude/common-prompt.md`.

**Security:** never store secrets, credentials, or PII in `.claude/memory/` — it is git-tracked.
