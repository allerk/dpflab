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

  const statusLabels: Record<string, string> = {
    new: 'Новая',
    contacted: 'Связались',
    qualified: 'Квалифицирована',
    booked: 'Записан',
    completed: 'Выполнено',
    lost: 'Проиграно'
  };

  const statusClasses: Record<string, string> = {
    new: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
    contacted: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
    qualified: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    booked: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    completed: 'border-accent/40 bg-accent/10 text-accent',
    lost: 'border-danger/40 bg-danger/10 text-danger'
  };

  let deleteModalOpen = false;
  let pendingDeleteForm: HTMLFormElement | null = null;
  let allowDelete = false;

  $: pipeline = {
    total: data.rows.length,
    contacted: data.rows.filter((row) => row.firstContactedAt).length,
    qualified: data.rows.filter((row) => row.qualifiedAt).length,
    booked: data.rows.filter((row) => row.bookedAt).length,
    completed: data.rows.filter((row) => row.completedAt).length,
    revenueCents: data.rows
      .filter((row) => row.completedAt)
      .reduce((sum, row) => sum + row.orderAmountCents, 0)
  };

  const rate = (count: number) =>
    pipeline.total ? `${Math.round((count / pipeline.total) * 100)}%` : '0%';

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

  <div class="mb-6 grid grid-cols-5 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
    <div class="rounded-card border border-border bg-bg-card p-4">
      <div class="text-xs text-fg-muted">Все заявки</div>
      <div class="mt-1 text-2xl font-bold">{pipeline.total}</div>
    </div>
    <div class="rounded-card border border-border bg-bg-card p-4">
      <div class="text-xs text-fg-muted">Связались</div>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-2xl font-bold">{pipeline.contacted}</span>
        <span class="text-xs text-fg-muted">{rate(pipeline.contacted)}</span>
      </div>
    </div>
    <div class="rounded-card border border-border bg-bg-card p-4">
      <div class="text-xs text-fg-muted">Квалифицированы</div>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-2xl font-bold">{pipeline.qualified}</span>
        <span class="text-xs text-fg-muted">{rate(pipeline.qualified)}</span>
      </div>
    </div>
    <div class="rounded-card border border-border bg-bg-card p-4">
      <div class="text-xs text-fg-muted">Записаны</div>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-2xl font-bold">{pipeline.booked}</span>
        <span class="text-xs text-fg-muted">{rate(pipeline.booked)}</span>
      </div>
    </div>
    <div class="rounded-card border border-border bg-bg-card p-4">
      <div class="text-xs text-fg-muted">Выполнено / выручка</div>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-2xl font-bold">{pipeline.completed}</span>
        <span class="text-xs text-accent">{(pipeline.revenueCents / 100).toFixed(2)} €</span>
      </div>
    </div>
  </div>

  {#if data.rows.length === 0}
    <p class="text-fg-muted text-sm">{admin_no_items()}</p>
  {:else}
    <div class="overflow-x-auto border border-border rounded-card">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-bg-card">
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Дата</th>
            <th class="text-left px-4 py-3 font-medium text-fg-muted">Статус</th>
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
              <td class="px-4 py-3 whitespace-nowrap align-top">
                <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold {statusClasses[row.status] ?? statusClasses.new}">
                  {statusLabels[row.status] ?? row.status}
                </span>
              </td>
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
