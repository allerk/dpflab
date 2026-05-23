---
name: tdd
description: Write and run vitest tests for repositories, server actions, admin auth, and frontend unit/logic (stores, utilities, component logic via @testing-library/svelte — excluding visual UI tests). Use when adding tests, doing red/green/refactor, debugging failing tests, or wiring an in-memory test DB. Triggers on mentions of vitest, tests, TDD, createTestDb, repository tests, component tests, or test helpers.
---

# TDD

Vitest. Run with `npm test`. Specs live in `tests/`, mirroring `src/lib/` structure.

**In scope:** repository tests, server-action tests, admin auth/session tests, Svelte component *logic* (props → DOM/event behavior via `@testing-library/svelte`), plain TS modules (stores, helpers, validators, `langstr`, Paraglide-consuming code).

**Out of scope:** visual/UI regression (screenshots, layout, animation, computed styles, hover/scroll effects). Those belong in a browser-driven tool, not vitest. If a test would fail because pixels moved, it's a UI test — skip it here.

## Test database

Real SQLite in memory — never mock the DB. Use the helper:

```ts
import { createTestDb, type TestDb } from '../helpers/db';
// tests/helpers/db.ts spins up :memory:, applies drizzle/ migrations
```

Each test gets a fresh DB via `beforeEach`. Repositories all accept `db` as a parameter ([[database]]), so wiring is just `await getFaqItems(db, 'ru')` — no module mocking.

## Test loop

1. **Red** — write the failing test first. Name it for the behavior, not the function (`returns items in requested locale ordered by sort_order`, not `getFaqItems works`).
2. **Green** — minimum code to pass. Resist the urge to refactor mid-loop.
3. **Refactor** — clean up only once green; rerun.

## What to cover

**Repositories & server actions:**
- Happy path with realistic data shape.
- Empty/missing case (no rows, missing locale → check fallback to `et`).
- Boundary: ordering, re-sequencing after delete, swap reorder.
- Write paths: insert assigns next `sortOrder`, delete re-sequences, update touches only the named row.
- Server actions: validation errors return `fail(422, …)` with the right shape; success writes the row.

**Frontend logic (Svelte components & TS modules):**
- Render with `@testing-library/svelte` and assert on accessible roles/text, not class names: `screen.getByRole('button', { name: /open/i })`.
- Props in → DOM out: pass typed props, check the rendered text/structure.
- User events via `@testing-library/user-event` — click, type, submit. Assert state change (text appears, `aria-expanded` flips, callback fires).
- Stores and pure helpers: call directly, assert return value or emitted updates. No DOM needed.
- Paraglide-consuming code: import the real message function and assert on its output for the active locale. Don't mock `$lib/paraglide/messages`.

## Conventions

- `describe(functionName, …)` → `it('does X when Y', …)`. One behavior per `it`.
- Use `db.insert(table).values([...])` directly for arrange — don't call repository writes inside tests of read functions, that couples failures.
- Assert on shape with `expect(items).toEqual([...])`, not field-by-field, when the row count is small and stable.
- For translatable text columns, arrange with `makeLangStr({et, ru})` so the test exercises the real serialization.
- Admin tests (`tests/admin/`) exercise session and whitelist logic without spinning up SvelteKit — call the pure functions directly.

## Anti-patterns

- Don't mock `db`, `drizzle`, or `@libsql/client`. The in-memory DB is the contract.
- Don't share state between tests — always `beforeEach(createTestDb)`.
- Don't test Paraglide message functions; they're generated. Test the code that *consumes* them.
- Don't assert on Tailwind class names, computed styles, pixel positions, or screenshots — that's UI testing and belongs elsewhere ([[styling]] changes won't break logic-level tests, and they shouldn't).
- Don't test third-party component internals (Svelte transitions, runtime). Test your own behavior on top.
- Don't `await tick()` as a substitute for `findBy*` — use the async query, it has proper retry semantics.
