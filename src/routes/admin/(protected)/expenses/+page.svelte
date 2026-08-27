<script lang="ts">
  import { page } from '$app/stores';
  import DeleteConfirmationModal from '$lib/components/admin/DeleteConfirmationModal.svelte';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  const categoryLabels: Record<string, string> = {
    utilities: 'Вода и электричество',
    rent: 'Аренда',
    equipment: 'Оборудование и ремонт',
    consumables: 'Общие расходники',
    marketing: 'Реклама вне Meta-синхронизации',
    transport: 'Транспорт',
    software_admin: 'Софт и администрация',
    taxes_fees: 'Налоги и комиссии',
    other: 'Прочее'
  };
  const inputClass = 'w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent';
  const euro = (value: number, currency = 'EUR') =>
    new Intl.NumberFormat('ru', { style: 'currency', currency }).format(value / 100);
  const previous = (key: string, fallback = '') =>
    String((form?.values as Record<string, unknown> | undefined)?.[key] ?? fallback);
  let deleteModalOpen = false;
  let pendingDeleteForm: HTMLFormElement | null = null;
  let allowDelete = false;
  function handleDeleteSubmit(event: SubmitEvent) {
    if (allowDelete) { allowDelete = false; return; }
    event.preventDefault();
    pendingDeleteForm = event.currentTarget as HTMLFormElement;
    deleteModalOpen = true;
  }
  function closeDeleteModal() { deleteModalOpen = false; pendingDeleteForm = null; }
  function confirmDelete() { allowDelete = true; }
</script>

<svelte:head><title>Расходы бизнеса — DPFLAB CRM</title></svelte:head>

<div class="mx-auto max-w-[1180px]">
  <header class="mb-6">
    <div class="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Учёт по периоду</div>
    <h1 class="mt-1 text-3xl">Расходы бизнеса</h1>
    <p class="mt-2 max-w-3xl text-sm text-fg-muted">Общие расходы DPFLAB без распределения по отдельным фильтрам. Здесь нет файлов и зарплаты владельцев; партнёрский сервис, оплаченный клиентом напрямую, сюда не попадает. Расход Meta Ads уже синхронизируется отдельно — не дублируйте его вручную.</p>
  </header>

  {#if $page.url.searchParams.has('saved')}<div class="mb-5 rounded border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">Расход записан.</div>{/if}
  {#if form?.error}<div class="mb-5 rounded border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{form.error}</div>{/if}

  <section class="mb-5 rounded-card border border-border bg-bg-card p-5">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div><div class="text-xs text-fg-muted">С {data.dateFrom} по {data.today}</div><div class="mt-1 text-sm">Общие расходы текущего месяца</div></div>
      <div class="flex flex-wrap gap-3">{#each data.totals as total}<strong class="font-mono text-2xl text-accent">{euro(total.amountCents, total.currency)}</strong>{/each}{#if !data.totals.length}<strong class="font-mono text-2xl">€0,00</strong>{/if}</div>
    </div>
  </section>

  <div class="grid grid-cols-[minmax(320px,.7fr)_minmax(0,1.3fr)] gap-5 max-lg:grid-cols-1">
    <section class="rounded-card border border-border bg-bg-card">
      <div class="border-b border-border px-5 py-3"><h2 class="text-sm">Добавить расход</h2><p class="mt-1 text-xs text-fg-muted">Только фактически оплаченные или подтверждённые траты DPFLAB.</p></div>
      <form method="POST" action="?/create" class="space-y-4 p-5">
        <div><label for="expense-date" class="mb-1 block text-xs text-fg-muted">Дата *</label><input id="expense-date" name="expense_date" type="date" required value={previous('expenseDate', data.today)} class={inputClass} /></div>
        <div><label for="category" class="mb-1 block text-xs text-fg-muted">Категория *</label><select id="category" name="category" required class={inputClass} value={previous('category', 'utilities')}>{#each Object.entries(categoryLabels) as [value, label]}<option {value}>{label}</option>{/each}</select></div>
        <div><label for="amount" class="mb-1 block text-xs text-fg-muted">Сумма, € *</label><input id="amount" name="amount" inputmode="decimal" required value={previous('amount')} placeholder="0,00" class={inputClass} /></div>
        <div><label for="vendor" class="mb-1 block text-xs text-fg-muted">Кому / поставщик</label><input id="vendor" name="vendor" maxlength="160" value={previous('vendor')} placeholder="Eesti Energia, аренда, заправка…" class={inputClass} /></div>
        <div><label for="comment" class="mb-1 block text-xs text-fg-muted">Комментарий</label><textarea id="comment" name="comment" rows="3" maxlength="1000" class={inputClass}>{previous('comment')}</textarea></div>
        <button class="w-full rounded-btn bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg hover:bg-accent-h" type="submit">Записать расход</button>
      </form>
    </section>

    <section class="overflow-hidden rounded-card border border-border bg-bg-card">
      <div class="border-b border-border px-5 py-3"><h2 class="text-sm">История расходов</h2><p class="mt-1 text-xs text-fg-muted">Последние 500 записей. Вложения не сохраняются.</p></div>
      {#if data.rows.length}
        <div class="overflow-x-auto"><table class="w-full min-w-[680px] text-left text-sm"><thead class="bg-bg text-[11px] uppercase tracking-wide text-fg-muted"><tr><th class="px-4 py-3">Дата</th><th class="px-4 py-3">Категория</th><th class="px-4 py-3">Описание</th><th class="px-4 py-3 text-right">Сумма</th><th class="w-12"></th></tr></thead><tbody class="divide-y divide-border">{#each data.rows as row}<tr><td class="px-4 py-3 font-mono text-xs">{row.expenseDate}</td><td class="px-4 py-3">{categoryLabels[row.category] ?? row.category}</td><td class="px-4 py-3"><div>{row.vendor || '—'}</div>{#if row.comment}<div class="mt-1 text-xs text-fg-muted">{row.comment}</div>{/if}</td><td class="px-4 py-3 text-right font-mono">{euro(row.amountCents, row.currency)}</td><td class="px-2"><form method="POST" action="?/delete" on:submit={handleDeleteSubmit}><input type="hidden" name="id" value={row.id} /><button class="rounded px-2 py-1 text-xs text-fg-muted hover:bg-danger/10 hover:text-danger" type="submit" aria-label="Удалить расход">×</button></form></td></tr>{/each}</tbody></table></div>
      {:else}<p class="p-6 text-sm text-fg-muted">Расходов пока нет.</p>{/if}
    </section>
  </div>
</div>

<DeleteConfirmationModal open={deleteModalOpen} form={pendingDeleteForm} onclose={closeDeleteModal} onconfirm={confirmDelete} />
