<script lang="ts">
  import DeleteConfirmationModal from '$lib/components/admin/DeleteConfirmationModal.svelte';
  import {
    admin_submissions_title,
    admin_action_view,
    admin_action_delete,
    admin_no_items
  } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;

  $: rows = data.rows;

  let deleteModalOpen = false;
  let pendingDeleteForm: HTMLFormElement | null = null;
  let allowDelete = false;

  function handleDeleteSubmit(event: SubmitEvent) {
    if (allowDelete) {
      allowDelete = false;
      return;
    }

    event.preventDefault();
    pendingDeleteForm = event.currentTarget as HTMLFormElement;
    deleteModalOpen = true;
  }

  function closeDeleteModal() {
    deleteModalOpen = false;
    pendingDeleteForm = null;
  }

  function confirmDelete() {
    allowDelete = true;
  }

  function formatDate(d: Date) {
    return new Intl.DateTimeFormat('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(d));
  }
</script>

<div class="max-w-5xl">
  <h1 class="text-2xl font-bold mb-6">{admin_submissions_title()}</h1>

  {#if rows.length === 0}
    <p class="text-fg-muted text-sm">{admin_no_items()}</p>
  {:else}
    <div class="overflow-x-auto border border-border rounded-card">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-bg-card">
            <th class="text-left px-4 py-2.5 font-medium text-fg-muted">Дата</th>
            <th class="text-left px-4 py-2.5 font-medium text-fg-muted">Имя</th>
            <th class="text-left px-4 py-2.5 font-medium text-fg-muted">Телефон</th>
            <th class="text-left px-4 py-2.5 font-medium text-fg-muted">Email</th>
            <th class="text-left px-4 py-2.5 font-medium text-fg-muted">Комментарий</th>
            <th class="text-left px-4 py-2.5 font-medium text-fg-muted">Язык</th>
            <th class="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row, i}
            <tr class="border-b border-border last:border-0 {i % 2 === 0 ? 'bg-bg' : 'bg-bg-card'}">
              <td class="px-4 py-2.5 whitespace-nowrap text-fg-muted">{formatDate(row.createdAt)}</td>
              <td class="px-4 py-2.5 font-medium">{row.name}</td>
              <td class="px-4 py-2.5">{row.phone}</td>
              <td class="px-4 py-2.5">{#if row.email}<a href="mailto:{row.email}" class="hover:text-accent transition-colors">{row.email}</a>{:else}<span class="text-fg-muted">—</span>{/if}</td>
              <td class="px-4 py-2.5 max-w-xs truncate text-fg-muted">{row.comment}</td>
              <td class="px-4 py-2.5 uppercase text-xs text-fg-muted">{row.locale}</td>
              <td class="px-4 py-2.5 whitespace-nowrap">
                <a href="/admin/submissions/{row.id}" class="text-xs px-2.5 py-1 rounded border border-border hover:bg-bg-card transition-colors mr-2">
                  {admin_action_view()}
                </a>
                <form method="POST" action="?/delete" class="inline" on:submit={handleDeleteSubmit}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit"
                    class="text-xs px-2.5 py-1 rounded border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer">
                    {admin_action_delete()}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<DeleteConfirmationModal
  open={deleteModalOpen}
  form={pendingDeleteForm}
  onclose={closeDeleteModal}
  onconfirm={confirmDelete}
/>
