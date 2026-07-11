<script lang="ts">
  import DeleteConfirmationModal from '$lib/components/admin/DeleteConfirmationModal.svelte';
  import { admin_action_back, admin_action_delete } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;

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

<div class="max-w-2xl">
  <a href="/admin/submissions" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>
  <h1 class="text-2xl font-bold mb-6">Заявка #{data.row.id}</h1>

  <dl class="bg-bg-card border border-border rounded-card divide-y divide-border">
    <div class="px-5 py-4">
      <dt class="text-sm text-fg-muted">Дата</dt>
      <dd class="mt-1">{formatDate(data.row.createdAt)}</dd>
    </div>
    <div class="px-5 py-4">
      <dt class="text-sm text-fg-muted">Имя</dt>
      <dd class="mt-1">{data.row.name}</dd>
    </div>
    <div class="px-5 py-4">
      <dt class="text-sm text-fg-muted">Телефон</dt>
      <dd class="mt-1">{data.row.phone}</dd>
    </div>
    <div class="px-5 py-4">
      <dt class="text-sm text-fg-muted">Email</dt>
      <dd class="mt-1">{#if data.row.email}<a href="mailto:{data.row.email}" class="hover:text-accent transition-colors">{data.row.email}</a>{:else}<span class="text-fg-muted">—</span>{/if}</dd>
    </div>
    <div class="px-5 py-4">
      <dt class="text-sm text-fg-muted">Язык</dt>
      <dd class="mt-1 uppercase text-sm">{data.row.locale}</dd>
    </div>
    <div class="px-5 py-4">
      <dt class="text-sm text-fg-muted">Комментарий</dt>
      <dd class="mt-1 whitespace-pre-wrap break-words">{data.row.comment || '—'}</dd>
    </div>
  </dl>

  <form method="POST" action="?/delete" class="mt-5" on:submit={handleDeleteSubmit}>
    <button type="submit" class="text-sm px-3 py-1.5 rounded border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer">
      {admin_action_delete()}
    </button>
  </form>
</div>

<DeleteConfirmationModal
  open={deleteModalOpen}
  form={pendingDeleteForm}
  onclose={closeDeleteModal}
  onconfirm={confirmDelete}
/>
