# Submission Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let administrators open full submission records and safely delete a submission from either its list row or detail page.

**Architecture:** Add a repository query for one submission, serve it through a protected `/admin/submissions/[id]` route, and use one Svelte confirmation modal before either deletion form is submitted.

**Tech Stack:** SvelteKit, Svelte 5, Drizzle ORM, Paraglide, Tailwind CSS v4, Vitest.

## Global Constraints

- Run `requireAdmin` before every submission data access.
- Invalid and missing IDs return 404; no schema or migration changes are needed.
- «Отмена» is the accent/primary action; «Удалить» is a red outlined secondary action.

---

### Task 1: Add a focused single-submission repository query

**Files:**
- Modify: `tests/db/contact-submissions.write.test.ts`
- Modify: `src/lib/db/repositories/contact-submissions.ts`

**Interfaces:** Produces `getContactSubmission(db: Db, id: number): Promise<SubmissionRow | undefined>`.

- [x] **Step 1: Write the failing test**

```ts
import { getContactSubmission } from '../../src/lib/db/repositories/contact-submissions';

it('returns the matching submission or undefined', async () => {
  await db.insert(contactSubmissions).values({ name: 'Alice', phone: '+1', email: 'alice@example.com', comment: 'Full note', locale: 'ru', createdAt: new Date() });
  const [inserted] = await getContactSubmissions(db);
  await expect(getContactSubmission(db, inserted.id)).resolves.toMatchObject({ id: inserted.id, comment: 'Full note' });
  await expect(getContactSubmission(db, 999_999)).resolves.toBeUndefined();
});
```

- [x] **Step 2: Run `npm test -- tests/db/contact-submissions.write.test.ts`; expect an import error.**
- [x] **Step 3: Implement**

```ts
export async function getContactSubmission(db: Db, id: number): Promise<SubmissionRow | undefined> {
  const [row] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
  return row;
}
```

- [x] **Step 4: Re-run the focused test; expect it to pass.**

### Task 2: Create the reusable destructive-action modal

**Files:**
- Create: `src/lib/components/admin/DeleteConfirmationModal.svelte`

**Interfaces:** Consumes `open: boolean`, `form: HTMLFormElement | null`, and `onclose: () => void`; its cancel button invokes `onclose`, while its delete button invokes `form?.requestSubmit()`.

- [x] **Step 1: Implement component** with an `aria-modal` dialog, backdrop, existing Paraglide `admin_confirm_delete`, `admin_action_cancel`, and `admin_action_delete` messages. Use `bg-accent text-white` for cancel and `border border-danger text-danger` for delete.
- [x] **Step 2: Run `npm run check`; expect no component errors.**

### Task 3: Implement and wire the details route

**Files:**
- Create: `src/routes/admin/(protected)/submissions/[id]/+page.server.ts`
- Create: `src/routes/admin/(protected)/submissions/[id]/+page.svelte`
- Modify: `src/routes/admin/(protected)/submissions/+page.svelte`

**Interfaces:** Consumes `getContactSubmission`, `deleteContactSubmission`, and `DeleteConfirmationModal`; produces `/admin/submissions/{id}` and an «Открыть» list action.

- [x] **Step 1: Create protected `load`**: parse `event.params.id`, call `requireAdmin`, call `getContactSubmission(getDb(event.platform), id)`, then throw `error(404, 'Not found')` for malformed/missing IDs.
- [x] **Step 2: Add detail delete action** that validates the route ID, logs like the list action, deletes it, and `redirect(303, '/admin/submissions')`.
- [x] **Step 3: Render detail page**: back link, title with ID, date, name, phone, linked email, locale, and a `whitespace-pre-wrap` full comment. Add deletion form and modal state (`pendingDeleteForm`, `deleteModalOpen`).
- [x] **Step 4: Update list page**: add its «Открыть» link; replace `onMount` plus native `confirm()` with the same modal state, opening the modal on a delete form submit and submitting only after confirmation.
- [x] **Step 5: Run `npm run check`; expect exit 0.**

### Task 4: Verify and commit

**Files:** all files above.

- [x] **Step 1: Run `npm test -- tests/db/contact-submissions.repository.test.ts tests/db/contact-submissions.write.test.ts`; expect all pass.**
- [x] **Step 2: Run `npm test && npm run check`; expect both commands exit 0.**
- [x] **Step 3: Run `git diff --check`; expect no whitespace errors.**
- [ ] **Step 4: Commit the feature:** `git commit -m "feat: add submission details page"`.
