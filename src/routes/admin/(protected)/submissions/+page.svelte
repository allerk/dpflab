<script lang="ts">
  import DeleteConfirmationModal from '$lib/components/admin/DeleteConfirmationModal.svelte';
  import { page } from '$app/stores';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  const serviceLabels: Record<string, string> = {
    dpf: 'DPF',
    fap: 'FAP',
    catalyst: 'Катализатор / DOC / SCR',
    diagnosis: 'Диагностика',
    other: 'Нужно уточнить'
  };
  const statusLabels: Record<string, string> = {
    new: 'Новая заявка', contacted: 'Уточняем запрос', diagnostics: 'Диагностика', partner: 'У партнёра',
    qualified: 'Сценарий подтверждён', quote_confirmed: 'Цена подтверждена', booked: 'Запись согласована',
    received: 'Фильтр принят', cleaning: 'Очистка', ready: 'Готов к возврату', completed: 'Оплачено / закрыто',
    follow_up: 'Перезвонить позже', lost: 'Потеряно', spam: 'Спам'
  };
  const statusClasses: Record<string, string> = {
    new: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
    contacted: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
    diagnostics: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
    partner: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
    qualified: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    quote_confirmed: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    booked: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    received: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    cleaning: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    ready: 'border-accent/40 bg-accent/10 text-accent',
    completed: 'border-accent/40 bg-accent/10 text-accent',
    follow_up: 'border-slate-400/40 bg-slate-400/10 text-slate-300',
    lost: 'border-danger/40 bg-danger/10 text-danger',
    spam: 'border-danger/40 bg-danger/10 text-danger'
  };
  const originLabels: Record<string, string> = {
    site: 'Сайт',
    meta_instant: 'Meta форма',
    whatsapp: 'WhatsApp',
    manual: 'Вручную'
  };
  const integrationLabels: Array<[keyof PageData['integrations'], string]> = [
    ['metaLeadImport', 'Meta лиды'],
    ['metaSpend', 'Meta расходы'],
    ['metaWebsiteEvents', 'Meta сайт'],
    ['metaCrmFeedback', 'Meta CRM'],
    ['googleEvents', 'Google события']
  ];

  const inputClass =
    'rounded-input border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent';
  let query = '';
  let status = 'active';
  let origin = 'all';
  let owner = 'all';
  let dueOnly = false;
  let deleteModalOpen = false;
  let pendingDeleteForm: HTMLFormElement | null = null;
  let allowDelete = false;

  const now = Date.now();
  const isActive = (value: string) => !['completed', 'lost', 'spam'].includes(value);
  const isOverdue = (row: PageData['rows'][number]) =>
    isActive(row.status) && Boolean(row.nextActionAt) && new Date(row.nextActionAt!).getTime() < now;
  const euro = (cents: number) =>
    new Intl.NumberFormat('ru', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const money = (cents: number, currency = 'EUR') =>
    new Intl.NumberFormat('ru', { style: 'currency', currency }).format(cents / 100);
  const ratio = (numerator: number, denominator: number) =>
    denominator > 0 ? `${(numerator / denominator).toFixed(2)}×` : '—';

  $: owners = [...new Set(data.rows.map((row) => row.assignedTo).filter(Boolean))].sort();
  $: filtered = data.rows.filter((row) => {
    const haystack = [
      row.name,
      row.phone,
      row.email,
      row.registrationNumber,
      row.vehicle,
      row.source,
      row.utmCampaign,
      row.id
    ]
      .join(' ')
      .toLocaleLowerCase();
    return (
      (!query || haystack.includes(query.trim().toLocaleLowerCase())) &&
      (status === 'all' || (status === 'active' ? isActive(row.status) : row.status === status)) &&
      (origin === 'all' || row.origin === origin) &&
      (owner === 'all' || (owner === 'unassigned' ? !row.assignedTo : row.assignedTo === owner)) &&
      (!dueOnly || isOverdue(row))
    );
  });
  $: pipeline = {
    new: data.rows.filter((row) => row.status === 'new').length,
    clarification: data.rows.filter((row) => ['contacted', 'diagnostics', 'partner', 'qualified', 'quote_confirmed'].includes(row.status)).length,
    booked: data.rows.filter((row) => row.status === 'booked').length,
    inWork: data.rows.filter((row) => ['received', 'cleaning', 'ready'].includes(row.status)).length,
    completed: data.rows.filter((row) => row.status === 'completed').length,
    overdue: data.rows.filter(isOverdue).length
  };

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
  function formatDate(value: Date | string, withTime = true) {
    return new Intl.DateTimeFormat('ru', {
      timeZone: 'Europe/Tallinn',
      day: '2-digit',
      month: '2-digit',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
    }).format(new Date(value));
  }
  function sourceLabel(row: PageData['rows'][number]) {
    const channel = originLabels[row.origin] ?? row.origin;
    const detail = row.utmCampaign || row.source || row.utmSource;
    return detail && detail !== 'direct' ? `${channel} · ${detail}` : channel;
  }
</script>

<svelte:head><title>CRM — DPFLAB</title></svelte:head>

<div class="mx-auto max-w-[1380px]">
  <header class="mb-6 flex items-start justify-between gap-5 max-sm:flex-col">
    <div>
      <div class="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Workshop dispatch</div>
      <h1 class="text-3xl">CRM / заявки</h1>
      <p class="mt-2 text-sm text-fg-muted">Сначала просроченные контакты, затем новые работы и фактический результат.</p>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-2 max-sm:w-full max-sm:justify-start">
      {#each integrationLabels as [key, label]}
        <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-card px-2.5 py-1 text-[11px] text-fg-muted">
          <span class="h-1.5 w-1.5 rounded-full {data.integrations[key] ? 'bg-accent' : 'bg-fg-muted/40'}"></span>{label}
        </span>
      {/each}
      <a href="/admin/submissions/new" class="ml-2 rounded-btn bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-h">+ Новая заявка</a>
    </div>
  </header>

  {#if $page.url.searchParams.has('marketing_synced')}
    <div class="mb-5 rounded border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">Расходы Meta обновлены: {$page.url.searchParams.get('marketing_synced')} строк.</div>
  {/if}
  {#if $page.url.searchParams.has('deliveries')}
    <div class="mb-5 rounded border border-border bg-bg-card px-4 py-3 text-sm">Очередь обработана (доставлено / отложено / ошибка / пропущено): {$page.url.searchParams.get('deliveries')}</div>
  {/if}
  {#if form?.syncError}
    <div class="mb-5 rounded border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{form.syncError}</div>
  {/if}

  <section class="mb-5 overflow-hidden rounded-card border border-border bg-bg-card">
    <div class="grid grid-cols-6 divide-x divide-border max-lg:grid-cols-3 max-lg:divide-y max-sm:grid-cols-2">
      {#each [
        ['Новые', pipeline.new, 'text-blue-300'],
        ['Уточнение', pipeline.clarification, 'text-cyan-300'],
        ['Записаны', pipeline.booked, 'text-amber-300'],
        ['В работе', pipeline.inWork, 'text-violet-300'],
        ['Оплачено', pipeline.completed, 'text-accent'],
        ['Просрочено', pipeline.overdue, pipeline.overdue ? 'text-danger' : 'text-fg-muted']
      ] as item}
        <div class="flex items-baseline justify-between gap-2 px-4 py-3">
          <span class="text-xs text-fg-muted">{item[0]}</span>
          <span class="font-mono text-xl font-bold {item[2]}">{item[1]}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="mb-6 overflow-hidden rounded-card border border-border bg-bg-card">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3"><div><h2 class="text-sm">Экономика бизнеса / последние 30 дней</h2><p class="mt-0.5 text-[11px] text-fg-muted">Выручка по дате оплаты минус записанные общие расходы и синхронизированный Meta Ads. Зарплата владельцев и налоги не оценены.</p></div><a href="/admin/expenses" class="rounded border border-border px-3 py-1.5 text-xs hover:border-accent">Вести расходы</a></div>
    <div class="grid grid-cols-5 gap-px bg-border max-lg:grid-cols-3 max-sm:grid-cols-2">
      {#each [
        ['Оплачено заказов', String(data.business.completedJobs)],
        ['Выручка DPFLAB', euro(data.business.completionRevenueCents)],
        ['Общие расходы', euro(data.business.recordedExpensesCents)],
        ['Meta Ads', data.business.metaSpendCents === null ? 'не сопоставимо' : euro(data.business.metaSpendCents)],
        ['Остаток по известным данным', data.business.knownBalanceCents === null ? '—' : euro(data.business.knownBalanceCents)]
      ] as metric}<div class="bg-bg-card px-4 py-3"><div class="text-[11px] text-fg-muted">{metric[0]}</div><div class="mt-1 font-mono text-base font-bold">{metric[1]}</div></div>{/each}
    </div>
    <p class="border-t border-border px-5 py-3 text-[11px] text-fg-muted">Это управленческий остаток, не бухгалтерская прибыль и пока не юнит-экономика. Платёж партнёрскому сервису, сделанный клиентом напрямую, не включён ни в выручку, ни в расходы DPFLAB.{#if data.business.expensesMixedCurrency} Есть расходы не в EUR — итог скрыт.{/if}{#if data.business.reportTruncated} Отчёт ограничен 5000 оплатами.{/if}</p>
  </section>

  <section class="mb-6 rounded-card border border-border bg-bg-card">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
      <div>
        <h2 class="text-sm">Meta Ads / 30-дневная когорта заявок</h2>
        <p class="mt-0.5 text-[11px] text-fg-muted">{data.report.periodFrom} → {data.report.periodTo} · заявки созданы в периоде; расход — за тот же календарный период</p>
      </div>
      <form method="POST" action="?/syncMarketing">
        <div class="flex gap-2">
          <button type="submit" disabled={!data.integrations.metaSpend} class="rounded border border-border px-3 py-1.5 text-xs hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Обновить расходы</button>
        </div>
      </form>
      <form method="POST" action="?/retryDeliveries">
        <button type="submit" class="rounded border border-border px-3 py-1.5 text-xs hover:border-accent">Повторить события</button>
      </form>
    </div>
    <div class="grid grid-cols-7 gap-px bg-border max-lg:grid-cols-4 max-sm:grid-cols-2">
      {#each [
        ['Расход', data.report.marketing.available ? (data.report.marketing.mixedCurrency ? 'несколько валют' : money(data.report.marketing.spendCents, data.report.marketing.currency ?? 'EUR')) : 'нет миграции'],
        ['Лиды Meta Ads', String(data.report.marketing.leads)],
        ['Лиды в CRM', String(data.report.metaLeadCount)],
        ['CPL Meta', data.report.marketing.mixedCurrency || data.report.marketing.costPerLeadCents === null ? '—' : money(data.report.marketing.costPerLeadCents, data.report.marketing.currency ?? 'EUR')],
        ['Закрыто', String(data.report.metaCompletedCount)],
        ['Выручка', euro(data.report.revenueCents)],
        ['ROAS', !data.report.marketing.mixedCurrency && (data.report.marketing.currency ?? 'EUR') === 'EUR' ? ratio(data.report.revenueCents, data.report.marketing.spendCents) : '— разные валюты']
      ] as metric}
        <div class="bg-bg-card px-4 py-3">
          <div class="text-[11px] text-fg-muted">{metric[0]}</div>
          <div class="mt-1 font-mono text-base font-bold">{metric[1]}</div>
        </div>
      {/each}
    </div>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border px-5 py-3 text-xs">
      <span class="text-[11px] text-fg-muted">ROAS — только выручка / рекламный расход, не прибыль и не ROI. Paid определяется campaign/ad/click ID. Без paid-атрибуции: {data.report.metaUnattributedCount}.</span>
      {#if data.report.reportTruncated}<span class="text-[11px] text-danger">Отчёт ограничен 5000 заявок — требуется SQL-агрегация.</span>{/if}
    </div>
    {#if data.report.campaigns?.length}
      <details class="border-t border-border">
        <summary class="cursor-pointer px-5 py-3 text-xs font-bold">Эффективность по кампаниям ({data.report.campaigns.length})</summary>
        <div class="overflow-x-auto border-t border-border">
          <table class="w-full min-w-[850px] text-xs">
            <thead><tr class="bg-bg"><th class="px-4 py-2 text-left text-fg-muted">Кампания</th><th class="px-4 py-2 text-right text-fg-muted">Расход</th><th class="px-4 py-2 text-right text-fg-muted">Meta лиды</th><th class="px-4 py-2 text-right text-fg-muted">CPL</th><th class="px-4 py-2 text-right text-fg-muted">CRM лиды</th><th class="px-4 py-2 text-right text-fg-muted">Закрыто</th><th class="px-4 py-2 text-right text-fg-muted">Выручка</th><th class="px-4 py-2 text-right text-fg-muted">ROAS</th></tr></thead>
            <tbody>{#each data.report.campaigns ?? [] as campaign}<tr class="border-t border-border"><td class="max-w-[320px] px-4 py-2"><div class="truncate" title={campaign.campaignName}>{campaign.campaignName}</div><div class="font-mono text-[9px] text-fg-muted">{campaign.campaignId || 'без campaign id'}</div></td><td class="px-4 py-2 text-right font-mono">{money(campaign.spendCents, campaign.currency)}</td><td class="px-4 py-2 text-right font-mono">{campaign.providerLeads}</td><td class="px-4 py-2 text-right font-mono">{campaign.cplCents === null ? '—' : money(campaign.cplCents, campaign.currency)}</td><td class="px-4 py-2 text-right font-mono">{campaign.crmLeads}</td><td class="px-4 py-2 text-right font-mono">{campaign.completed}</td><td class="px-4 py-2 text-right font-mono">{euro(campaign.revenueCents)}</td><td class="px-4 py-2 text-right font-mono">{campaign.currency === 'EUR' ? ratio(campaign.revenueCents, campaign.spendCents) : '—'}</td></tr>{/each}</tbody>
          </table>
        </div>
      </details>
    {/if}
  </section>

  <section class="mb-4 flex flex-wrap items-center gap-2 rounded-card border border-border bg-bg-card p-3">
    <input bind:value={query} aria-label="Поиск" placeholder="Имя, телефон, машина, кампания…" class="{inputClass} min-w-[260px] flex-1" />
    <select bind:value={status} aria-label="Статус" class={inputClass}>
      <option value="active">В работе</option><option value="all">Все статусы</option>
      {#each Object.entries(statusLabels) as [value, label]}<option {value}>{label}</option>{/each}
    </select>
    <select bind:value={origin} aria-label="Канал" class={inputClass}>
      <option value="all">Все каналы</option>
      {#each Object.entries(originLabels) as [value, label]}<option {value}>{label}</option>{/each}
    </select>
    <select bind:value={owner} aria-label="Ответственный" class={inputClass}>
      <option value="all">Все ответственные</option><option value="unassigned">Без ответственного</option>
      {#each owners as item}<option value={item}>{item}</option>{/each}
    </select>
    <label class="flex items-center gap-2 rounded-input border border-border bg-bg px-3 py-2 text-sm text-fg-muted">
      <input type="checkbox" bind:checked={dueOnly} /> Просроченные
    </label>
  </section>

  <div class="mb-2 flex items-center justify-between text-xs text-fg-muted">
    <span>Показано {filtered.length} из {data.rows.length}</span>
    {#if data.rows.length === 200}<span class="text-amber-300">Загружены последние 200 — нужна пагинация</span>{/if}
  </div>

  {#if filtered.length === 0}
    <div class="rounded-card border border-dashed border-border px-5 py-12 text-center text-sm text-fg-muted">В этом срезе заявок нет.</div>
  {:else}
    <div class="overflow-x-auto rounded-card border border-border">
      <table class="w-full min-w-[1050px] text-sm">
        <thead><tr class="border-b border-border bg-bg-card">
          <th class="px-4 py-3 text-left text-xs font-medium text-fg-muted">Приоритет / контакт</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-fg-muted">Работа</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-fg-muted">Этап</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-fg-muted">Следующий шаг</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-fg-muted">Источник</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-fg-muted">Результат</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          {#each filtered as row}
            <tr class="border-b border-border bg-bg last:border-0 hover:bg-bg-card/60 {isOverdue(row) ? 'border-l-2 border-l-danger' : row.status === 'new' ? 'border-l-2 border-l-blue-400' : ''}">
              <td class="px-4 py-3 align-top">
                <div class="mb-0.5 flex items-center gap-2">
                  <a class="font-semibold hover:text-accent" href="/admin/submissions/{row.id}">{row.name || `Заявка #${row.id}`}</a>
                  <span class="font-mono text-[10px] text-fg-muted">#{row.id}</span>
                </div>
                {#if row.phone}<a href="tel:{row.phone}" class="block text-xs text-fg-muted hover:text-accent">{row.phone}</a>{/if}
                <div class="mt-1 text-[10px] text-fg-muted">{formatDate(row.createdAt)} · {row.assignedTo || 'не назначен'}</div>
              </td>
              <td class="max-w-[260px] px-4 py-3 align-top">
                <div>{serviceLabels[row.serviceType] ?? row.serviceType ?? 'Нужно уточнить'}</div>
                <div class="mt-0.5 truncate font-mono text-xs text-accent" title={row.registrationNumber}>{row.registrationNumber || 'Номер не указан'}</div>
                {#if row.vehicle}<div class="mt-0.5 truncate text-[10px] text-fg-muted" title={row.vehicle}>{row.vehicle}</div>{/if}
              </td>
              <td class="px-4 py-3 align-top"><span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold {statusClasses[row.status] ?? statusClasses.new}">{statusLabels[row.status] ?? row.status}</span></td>
              <td class="max-w-[250px] px-4 py-3 align-top">
                {#if row.nextActionAt}
                  <div class="text-xs {isOverdue(row) ? 'font-bold text-danger' : 'text-fg'}">{isOverdue(row) ? 'Просрочено · ' : ''}{formatDate(row.nextActionAt)}</div>
                  <div class="mt-0.5 truncate text-xs text-fg-muted" title={row.nextActionNote}>{row.nextActionNote || 'Без пояснения'}</div>
                {:else if isActive(row.status)}
                  <span class="text-xs text-amber-300">Не запланирован</span>
                {:else}<span class="text-xs text-fg-muted">—</span>{/if}
              </td>
              <td class="max-w-[230px] px-4 py-3 align-top"><div class="truncate text-xs" title={sourceLabel(row)}>{sourceLabel(row)}</div><div class="mt-0.5 font-mono text-[10px] uppercase text-fg-muted">{row.locale}</div></td>
              <td class="px-4 py-3 text-right align-top font-mono text-xs">
                {#if row.orderAmountCents > 0}
                  <div>{euro(row.orderAmountCents)}</div>
                  <div class="mt-0.5 text-fg-muted">выручка DPFLAB</div>
                {:else}<span class="text-fg-muted">—</span>{/if}
              </td>
              <td class="px-4 py-3 align-top">
                <div class="flex justify-end gap-2">
                  <a href="/admin/submissions/{row.id}" class="rounded border border-border px-2.5 py-1 text-xs hover:border-accent">Открыть</a>
                  <form method="POST" action="?/delete" on:submit={handleDeleteSubmit}>
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" aria-label="Удалить заявку {row.id}" class="rounded border border-danger/50 px-2 py-1 text-xs text-danger hover:bg-danger/10">×</button>
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

<DeleteConfirmationModal open={deleteModalOpen} form={pendingDeleteForm} onclose={closeDeleteModal} onconfirm={confirmDelete} />
