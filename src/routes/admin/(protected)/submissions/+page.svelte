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

  const serviceLabels: Record<string, string> = {
    dpf: 'DPF',
    fap: 'FAP',
    catalyst: 'Катализатор / DOC / SCR',
    diagnosis: 'Диагностика',
    other: 'Не определено'
  };

  const stateLabels: Record<string, string> = {
    removed: 'Фильтр снят',
    workshop: 'В автосервисе',
    installed: 'На автомобиле',
    unsure: 'Нужна консультация'
  };

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

  function sourceLabel(row: PageData['rows'][number]) {
    if (row.utmCampaign) return row.utmCampaign;
    if (row.utmSource) return [row.utmSource, row.utmMedium].filter(Boolean).join(' / ');
    if (row.fbclid) return 'Meta';
    return 'Прямой / неизвестно';
  }
</script>

<div class="max-w-6xl">
  <div class="flex items-end justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold">{admin_submissions_title()}</h1>
      <p class="text-sm text-fg-muted mt-1">Заявки с сайта и данные рекламного источника</p>
    </div>
    <span class="font-mono text-xs text-fg-muted">{data.rows.length} / 200</span>
  </div>

  {#if data.rows.length === 0}
    <p class="text-fg-muted text-sm">{admin_no_items()}</p>
  {:else}
    <div class="overflow-x-auto border border-border rounded-card">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-bg-card">
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Дата</th>
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Контакт</th>
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Задача</th>
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Источник</th>
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Язык</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {#each data.rows as row, i}
            <tr class="border-b border-border last:border-0 {i % 2 === 0 ? 'bg-bg' : 'bg-bg-card'}">
              <td class="px-4 py-3 whitespace-nowrap text-fg-muted align-top">{formatDate(row.createdAt)}</td>
              <td class="px-4 py-3 align-top">
                <div class="font-medium">{row.name}</div>
                <a href="tel:{row.phone}" class="text-xs text-fg-muted hover:text-accent">{row.phone}</a>
                {#if row.email}<div><a href="mailto:{row.email}" class="text-xs text-fg-muted hover:text-accent">{row.email}</a></div>{/if}
              </td>
              <td class="px-4 py-3 align-top max-w-[320px]">
                <div class="font-medium">{serviceLabels[row.serviceType] ?? row.serviceType ?? 'Старая заявка'}</div>
                <div class="text-xs text-fg-muted">{stateLabels[row.filterState] ?? row.filterState}</div>
                {#if row.vehicle}<div class="text-xs mt-1 truncate">{row.vehicle}</div>{/if}
              </td>
              <td class="px-4 py-3 align-top max-w-[220px]">
                <div class="text-xs truncate" title={sourceLabel(row)}>{sourceLabel(row)}</div>
              </td>
              <td class="px-4 py-3 uppercase text-xs text-fg-muted align-top">{row.locale}</td>
              <td class="px-4 py-3 whitespace-nowrap align-top">
                <div class="flex items-start gap-2">
                  <a href="/admin/submissions/{row.id}" class="inline-flex items-center text-xs px-2.5 py-1 rounded border border-border hover:bg-bg-card transition-colors">
                    {admin_action_view()}
                  </a>
                  <form method="POST" action="?/delete" class="inline-flex" on:submit={handleDeleteSubmit}>
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" class="text-xs px-2.5 py-1 rounded border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer">
                      {admin_action_delete()}
                    </button>
                  </form>
                </div>
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
