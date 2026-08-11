<script lang="ts">
  import DeleteConfirmationModal from '$lib/components/admin/DeleteConfirmationModal.svelte';
  import { page } from '$app/stores';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  const labels: Record<string, Record<string, string>> = {
    clientType: { private: 'Владелец автомобиля', workshop: 'Автосервис', fleet: 'Компания / автопарк' },
    serviceType: { dpf: 'Очистка DPF', fap: 'Очистка FAP', catalyst: 'Катализатор / DOC / SCR', diagnosis: 'Диагностика', other: 'Нужно уточнить' },
    filterState: { removed: 'Фильтр уже снят', workshop: 'Фильтр в автосервисе', installed: 'Фильтр установлен на автомобиле', unsure: 'Нужна консультация' },
    urgency: { today: 'Сегодня', days_1_3: 'В течение 1–3 дней', this_week: 'На этой неделе', consultation: 'Пока консультация' },
    preferredContact: { phone: 'Телефон', whatsapp: 'WhatsApp', email: 'E-mail' },
    symptoms: { warning: 'Горит DPF / Check Engine', power: 'Пропала мощность', regeneration: 'Частая регенерация', smoke: 'Дым или запах', other: 'Другая проблема' }
  };
  const statusLabels: Record<string, string> = {
    new: 'Новая заявка', contacted: 'Уточняем запрос', diagnostics: 'Диагностика', partner: 'У партнёра: снятие / установка',
    qualified: 'Сценарий подтверждён', quote_confirmed: 'Цена подтверждена', booked: 'Запись согласована',
    received: 'Фильтр принят', cleaning: 'Очистка', ready: 'Готов к возврату', completed: 'Оплачено / закрыто',
    follow_up: 'Перезвонить позже', lost: 'Потеряно', spam: 'Спам'
  };
  const statusClasses: Record<string, string> = {
    new: 'border-blue-400/40 bg-blue-400/10 text-blue-300', contacted: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300', diagnostics: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300', partner: 'border-orange-400/40 bg-orange-400/10 text-orange-300', qualified: 'border-amber-400/40 bg-amber-400/10 text-amber-300', quote_confirmed: 'border-amber-400/40 bg-amber-400/10 text-amber-300', booked: 'border-violet-400/40 bg-violet-400/10 text-violet-300', received: 'border-violet-400/40 bg-violet-400/10 text-violet-300', cleaning: 'border-violet-400/40 bg-violet-400/10 text-violet-300', ready: 'border-accent/40 bg-accent/10 text-accent', completed: 'border-accent/40 bg-accent/10 text-accent', follow_up: 'border-slate-400/40 bg-slate-400/10 text-slate-300', lost: 'border-danger/40 bg-danger/10 text-danger', spam: 'border-danger/40 bg-danger/10 text-danger'
  };
  const originLabels: Record<string, string> = { site: 'Форма сайта', meta_instant: 'Meta Instant Form', whatsapp: 'WhatsApp', manual: 'Ручной ввод' };
  const activityLabels: Record<string, string> = {
    lead_created: 'Заявка создана', staff_lead_created: 'Заявка добавлена вручную', meta_lead_imported: 'Получена из Meta', status_changed: 'Изменён этап', pipeline_updated: 'Обновлена карточка', operations_updated: 'Обновлены данные работы', revenue_updated: 'Обновлена цена DPFLAB', financials_updated: 'Обновлена старая финансовая запись', next_action_updated: 'Запланирован следующий шаг', note_added: 'Добавлена заметка'
  };
  const deliveryStatusLabels: Record<string, string> = { pending: 'В очереди', processing: 'Отправляется', sent: 'Доставлено', failed: 'Повторим', dead: 'Нужна проверка', skipped: 'Не отправлено по правилу' };
  const inputClass = 'w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent';

  let pipelineStatus = data.row.status;
  let revenue = (data.row.orderAmountCents / 100).toFixed(2);
  let deleteModalOpen = false;
  let pendingDeleteForm: HTMLFormElement | null = null;
  let allowDelete = false;
  const revenueLocked = data.row.completedAt !== null;

  const cents = (value: string) => Math.max(0, Math.round((Number(value.replace(',', '.')) || 0) * 100));
  const euro = (value: number) => new Intl.NumberFormat('ru', { style: 'currency', currency: 'EUR' }).format(value / 100);
  $: revenueCents = cents(revenue);
  $: symptoms = (() => {
    try { return (JSON.parse(data.row.symptoms) as string[]).map((value) => labels.symptoms[value] ?? value); }
    catch { return data.row.symptoms ? [data.row.symptoms] : []; }
  })();

  const fieldLabel = (group: keyof typeof labels, value: string) => labels[group][value] ?? (value || '—');
  function formatDate(value: Date | string, withYear = true) {
    return new Intl.DateTimeFormat('ru', {
      timeZone: 'Europe/Tallinn', day: '2-digit', month: '2-digit', ...(withYear ? { year: 'numeric' } : {}), hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
  }
  function dateTimeLocal(value: Date | string | null) {
    if (!value) return '';
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tallinn', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
  }
  function activityDetail(activity: PageData['activities'][number]) {
    try {
      const detail = JSON.parse(activity.detailsJson) as Record<string, unknown>;
      if (activity.activityType === 'note_added') return String(detail.note ?? '');
      if (activity.activityType === 'status_changed') return `${statusLabels[activity.fromValue] ?? activity.fromValue} → ${statusLabels[activity.toValue] ?? activity.toValue}`;
      if (activity.activityType === 'next_action_updated') {
        const to = detail.to as { at?: string | null; note?: string } | undefined;
        return to?.at ? `${formatDate(to.at)} · ${to.note ?? ''}` : 'План снят';
      }
      if (activity.activityType === 'financials_updated') return 'Старая финансовая запись сохранена';
      if (activity.activityType === 'revenue_updated') return 'Цена услуги DPFLAB сохранена';
      if (activity.activityType === 'operations_updated') return 'Маршрут, госномер и данные партнёра сохранены';
      return activity.toValue || '';
    } catch { return activity.toValue || ''; }
  }
  function handleDeleteSubmit(event: SubmitEvent) {
    if (allowDelete) { allowDelete = false; return; }
    event.preventDefault();
    pendingDeleteForm = event.currentTarget as HTMLFormElement;
    deleteModalOpen = true;
  }
  function closeDeleteModal() { deleteModalOpen = false; pendingDeleteForm = null; }
  function confirmDelete() { allowDelete = true; }
</script>

<svelte:head><title>Заявка #{data.row.id} — DPFLAB CRM</title></svelte:head>

<div class="mx-auto max-w-[1240px]">
  <a href="/admin/submissions" class="mb-5 inline-flex text-sm text-fg-muted hover:text-fg">← Все заявки</a>

  <header class="mb-6 flex items-start justify-between gap-5 max-sm:flex-col">
    <div>
      <div class="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{originLabels[data.row.origin] ?? data.row.origin} / {data.row.locale} / #{data.row.id}</div>
      <h1 class="text-3xl">{data.row.name || `Заявка #${data.row.id}`}</h1>
      <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {#if data.row.phone}<a class="hover:text-accent" href="tel:{data.row.phone}">{data.row.phone}</a>{/if}
        {#if data.row.phone}<a class="text-accent hover:underline" target="_blank" rel="noreferrer" href="https://wa.me/{data.row.phone.replace(/\D/g, '')}">Открыть WhatsApp</a>{/if}
        {#if data.row.email}<a class="text-fg-muted hover:text-accent" href="mailto:{data.row.email}">{data.row.email}</a>{/if}
        {#if data.row.registrationNumber}<span class="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">{data.row.registrationNumber}</span>{/if}
      </div>
    </div>
    <div class="text-right max-sm:text-left">
      <span class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold {statusClasses[data.row.status] ?? statusClasses.new}">{statusLabels[data.row.status] ?? data.row.status}</span>
      <div class="mt-2 font-mono text-[11px] text-fg-muted">Создана {formatDate(data.row.createdAt)}</div>
    </div>
  </header>

  {#if $page.url.searchParams.has('saved')}
    <div class="mb-5 rounded border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">Изменения сохранены.</div>
  {/if}
  {#if $page.url.searchParams.has('delivery')}
    <div class="mb-5 rounded border border-border bg-bg-card px-4 py-3 text-sm">Отправка: {$page.url.searchParams.get('delivery') === 'sent' ? 'доставлено' : 'оставлено в очереди — проверьте настройку'}</div>
  {/if}
  {#if form?.error}
    <div class="mb-5 rounded border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{form.error}</div>
  {/if}
  {#if data.duplicates.length}
    <aside class="mb-5 rounded-card border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm">
      <span class="font-bold text-amber-300">Возможный дубль:</span>
      {#each data.duplicates as duplicate}<a class="ml-2 underline hover:text-accent" href="/admin/submissions/{duplicate.id}">#{duplicate.id} {duplicate.name}</a>{/each}
    </aside>
  {/if}

  <div class="grid grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)] gap-5 max-lg:grid-cols-1">
    <div class="space-y-5">
      <section class="overflow-hidden rounded-card border border-border bg-bg-card">
        <div class="border-b border-border px-5 py-3"><h2 class="text-sm">Следующее действие</h2><p class="mt-0.5 text-xs text-fg-muted">Открытая карточка без даты легко теряется.</p></div>
        <form method="POST" action="?/nextAction" class="grid grid-cols-[220px_1fr_auto] gap-3 p-5 max-sm:grid-cols-1">
          <div><label for="next-action-at" class="mb-1.5 block text-xs text-fg-muted">Дата и время · Tallinn</label><input id="next-action-at" name="next_action_at" type="datetime-local" value={dateTimeLocal(data.row.nextActionAt)} class={inputClass} /></div>
          <div><label for="next-action-note" class="mb-1.5 block text-xs text-fg-muted">Что сделать</label><input id="next-action-note" name="next_action_note" maxlength="500" value={data.row.nextActionNote} placeholder="Позвонить, подтвердить доставку, запросить номер детали…" class={inputClass} /></div>
          <button type="submit" class="mt-[22px] rounded-btn bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg hover:bg-accent-h max-sm:mt-0">Запланировать</button>
        </form>
      </section>

      <section class="overflow-hidden rounded-card border border-border bg-bg-card">
        <div class="border-b border-border px-5 py-3"><h2 class="text-sm">Этап и ответственный</h2><p class="mt-0.5 text-xs text-fg-muted">При завершении CRM поставит в очередь Meta/Google-события только при допустимой настройке.</p></div>
        <form method="POST" action="?/pipeline" class="grid grid-cols-2 gap-4 p-5 max-sm:grid-cols-1">
          <div><label for="pipeline-status" class="mb-1.5 block text-xs text-fg-muted">Этап</label><select id="pipeline-status" name="status" bind:value={pipelineStatus} class={inputClass}>{#each Object.entries(statusLabels) as [value, text]}<option {value}>{text}</option>{/each}</select></div>
          <div><label for="assigned-to" class="mb-1.5 block text-xs text-fg-muted">Ответственный</label><input id="assigned-to" name="assigned_to" maxlength="160" value={data.row.assignedTo} placeholder="Имя сотрудника" class={inputClass} /></div>
          {#if pipelineStatus === 'lost'}
            <div><label for="loss-reason-code" class="mb-1.5 block text-xs text-fg-muted">Причина потери *</label><select id="loss-reason-code" name="loss_reason_code" required class={inputClass} value={data.row.lossReasonCode}><option value="">Выберите</option><option value="expensive">Дорого</option><option value="unsuitable">Не подходит услуга</option><option value="no_answer">Не отвечает</option><option value="postponed">Отложил</option><option value="chose_other">Выбрал другое место</option><option value="duplicate">Дубль</option><option value="other">Другое</option></select></div>
            <div><label for="loss-reason" class="mb-1.5 block text-xs text-fg-muted">Комментарий</label><input id="loss-reason" name="loss_reason" maxlength="500" value={data.row.lossReason} class={inputClass} /></div>
          {:else}<input type="hidden" name="loss_reason_code" value={data.row.lossReasonCode} /><input type="hidden" name="loss_reason" value={data.row.lossReason} />{/if}
          <div class="col-span-2 max-sm:col-span-1"><label for="admin-notes" class="mb-1.5 block text-xs text-fg-muted">Постоянные рабочие заметки</label><textarea id="admin-notes" name="admin_notes" rows="3" maxlength="3000" class={inputClass}>{data.row.adminNotes}</textarea></div>
          <div class="col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 max-sm:col-span-1">
            <div class="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-fg-muted">{#if data.row.firstContactedAt}<span>contact {formatDate(data.row.firstContactedAt, false)}</span>{/if}{#if data.row.partnerAt}<span>partner {formatDate(data.row.partnerAt, false)}</span>{/if}{#if data.row.quoteConfirmedAt}<span>price {formatDate(data.row.quoteConfirmedAt, false)}</span>{/if}{#if data.row.bookedAt}<span>booked {formatDate(data.row.bookedAt, false)}</span>{/if}{#if data.row.receivedAt}<span>received {formatDate(data.row.receivedAt, false)}</span>{/if}{#if data.row.completedAt}<span>paid {formatDate(data.row.completedAt, false)}</span>{/if}</div>
            <button type="submit" class="rounded-btn bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-h">Сохранить этап</button>
          </div>
        </form>
      </section>

      <section class="overflow-hidden rounded-card border border-border bg-bg-card">
        <div class="border-b border-border px-5 py-3"><h2 class="text-sm">Маршрут фильтра и работа</h2><p class="mt-0.5 text-xs text-fg-muted">DPFLAB очищает снятый узел. Снятие и установка у партнёра учитываются отдельно.</p></div>
        <form method="POST" action="?/operations" class="grid grid-cols-2 gap-4 p-5 max-sm:grid-cols-1">
          <div><label for="service-type" class="mb-1 block text-xs text-fg-muted">Услуга</label><select id="service-type" name="service_type" class={inputClass} value={data.row.serviceType}><option value="">Не заполнено</option><option value="dpf">Очистка DPF</option><option value="fap">Очистка FAP</option><option value="catalyst">Катализатор / DOC / SCR</option><option value="diagnosis">Диагностика</option><option value="other">Нужно уточнить</option></select></div>
          <div><label for="filter-state" class="mb-1 block text-xs text-fg-muted">Маршрут</label><select id="filter-state" name="filter_state" class={inputClass} value={data.row.filterState}><option value="installed">На автомобиле — партнёр снимает / ставит</option><option value="removed">Уже снят — напрямую в DPFLAB</option><option value="workshop">В другом сервисе — забор / возврат</option><option value="unsure">Неясно — сначала диагностика</option><option value="">Не заполнено</option></select></div>
          <div><label for="registration-number" class="mb-1 block text-xs text-fg-muted">Госномер автомобиля</label><input id="registration-number" name="registration_number" maxlength="40" autocapitalize="characters" spellcheck="false" value={data.row.registrationNumber} placeholder="123 ABC" class={inputClass} /><p class="mt-1 text-[10px] leading-relaxed text-fg-muted">Основной ключ для идентификации машины и проверки фильтра.</p></div>
          <div><label for="vehicle" class="mb-1 block text-xs text-fg-muted">Модель / двигатель, если уже известны</label><input id="vehicle" name="vehicle" maxlength="240" value={data.row.vehicle} class={inputClass} /></div>
          <div><label for="part-number" class="mb-1 block text-xs text-fg-muted">Номер детали</label><input id="part-number" name="part_number" maxlength="120" value={data.row.partNumber} class={inputClass} /></div>
          <div><label for="diagnostic-code" class="mb-1 block text-xs text-fg-muted">Ошибки диагностики</label><input id="diagnostic-code" name="diagnostic_code" maxlength="240" value={data.row.diagnosticCode} placeholder="P2002, P2463…" class={inputClass} /></div>
          <div><label for="pickup-address" class="mb-1 block text-xs text-fg-muted">Адрес забора / возврата</label><input id="pickup-address" name="pickup_address" maxlength="500" value={data.row.pickupAddress} class={inputClass} /></div>
          <div><label for="pressure-before" class="mb-1 block text-xs text-fg-muted">Давление до, mbar</label><input id="pressure-before" name="pressure_before_mbar" inputmode="numeric" value={data.row.pressureBeforeMbar ?? ''} class={inputClass} /></div>
          <div><label for="pressure-after" class="mb-1 block text-xs text-fg-muted">Давление после, mbar</label><input id="pressure-after" name="pressure_after_mbar" inputmode="numeric" value={data.row.pressureAfterMbar ?? ''} class={inputClass} /></div>
          <div><label for="partner-workshop" class="mb-1 block text-xs text-fg-muted">Партнёрский сервис</label><input id="partner-workshop" name="partner_workshop" maxlength="160" value={data.row.partnerWorkshop} class={inputClass} /></div>
          <div><label for="partner-contact" class="mb-1 block text-xs text-fg-muted">Контакт партнёра</label><input id="partner-contact" name="partner_contact" maxlength="160" value={data.row.partnerContact} class={inputClass} /></div>
          <div><label for="partner-payment" class="mb-1 block text-xs text-fg-muted">Оплата партнёра</label><select id="partner-payment" name="partner_payment_model" class={inputClass} value={data.row.partnerPaymentModel}><option value="not_applicable">Не требуется</option><option value="customer_direct">Клиент платит партнёру напрямую</option><option value="unknown">Ещё не выяснили</option></select></div>
          <div><label for="partner-price" class="mb-1 block text-xs text-fg-muted">Цена партнёра клиенту, €</label><input id="partner-price" name="partner_customer_price" inputmode="decimal" value={(data.row.partnerCustomerPriceCents / 100).toFixed(2)} class={inputClass} /><p class="mt-1 text-[10px] text-fg-muted">Справочно; не считается расходом DPFLAB при прямой оплате.</p></div>
          <div class="col-span-2 flex items-center justify-between gap-3 border-t border-border pt-4 max-sm:col-span-1"><span class="text-xs text-fg-muted">Срочность из заявки: {fieldLabel('urgency', data.row.urgency)}</span><button type="submit" class="rounded-btn bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-h">Сохранить работу</button></div>
        </form>
      </section>
      <section class="overflow-hidden rounded-card border border-border bg-bg-card"><h2 class="border-b border-border px-5 py-3 text-sm">Клиент и источник</h2><dl class="grid grid-cols-3 divide-x divide-border text-sm max-sm:grid-cols-1 max-sm:divide-x-0 max-sm:divide-y"><div class="px-5 py-3"><dt class="text-xs text-fg-muted">Тип</dt><dd class="mt-1">{fieldLabel('clientType', data.row.clientType)}</dd></div><div class="px-5 py-3"><dt class="text-xs text-fg-muted">Канал связи</dt><dd class="mt-1">{fieldLabel('preferredContact', data.row.preferredContact)}</dd></div><div class="px-5 py-3"><dt class="text-xs text-fg-muted">Источник</dt><dd class="mt-1">{data.row.source || originLabels[data.row.origin] || data.row.origin}</dd></div></dl></section>
      {#if data.row.comment || symptoms.length}<section class="rounded-card border border-border bg-bg-card p-5"><h2 class="text-sm">Исходный запрос</h2>{#if symptoms.length}<p class="mt-2 text-xs text-fg-muted">{symptoms.join(' · ')}</p>{/if}{#if data.row.comment}<p class="mt-3 whitespace-pre-wrap text-sm">{data.row.comment}</p>{/if}</section>{/if}
    </div>

    <aside class="space-y-5">
      <section class="overflow-hidden rounded-card border border-border bg-bg-card">
        <div class="border-b border-border px-5 py-3"><h2 class="text-sm">Выручка DPFLAB</h2><p class="mt-0.5 text-xs text-fg-muted">{revenueLocked ? 'Цена зафиксирована вместе с оплаченной конверсией.' : 'Только сумма за услуги DPFLAB. Все расходы бизнеса ведутся по периоду.'}</p></div>
        <form method="POST" action="?/revenue" class="p-5 {revenueLocked ? 'opacity-70' : ''}">
          <div class="mb-5 rounded border border-border bg-bg p-4"><div class="text-[11px] text-fg-muted">Цена DPFLAB</div><div class="mt-1 font-mono text-3xl font-bold text-accent">{euro(revenueCents)}</div><p class="mt-3 text-xs text-fg-muted">Это выручка, не прибыль. Вода, электричество, аренда, реклама и другие общие траты вычитаются в отчёте за период.</p></div>
          <div><label for="order-amount" class="mb-1 block text-xs text-fg-muted">Цена клиенту за DPFLAB, €</label><input id="order-amount" name="order_amount" inputmode="decimal" disabled={revenueLocked} bind:value={revenue} class={inputClass} /></div>
          <button type="submit" disabled={revenueLocked} class="mt-4 w-full rounded-btn bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg hover:bg-accent-h disabled:cursor-not-allowed disabled:opacity-50">{revenueLocked ? 'Цена зафиксирована' : 'Сохранить цену'}</button>
          <a href="/admin/expenses" class="mt-3 block text-center text-xs text-fg-muted hover:text-accent">Открыть общие расходы →</a>
        </form>
      </section>

      <section class="overflow-hidden rounded-card border border-border bg-bg-card">
        <h2 class="border-b border-border px-5 py-3 text-sm">История</h2>
        <form method="POST" action="?/addNote" class="flex gap-2 border-b border-border p-4"><input name="activity_note" maxlength="1500" placeholder="Короткая заметка…" class="{inputClass} min-w-0" /><button class="rounded border border-border px-3 text-xs hover:border-accent" type="submit">Добавить</button></form>
        <ol class="max-h-[460px] divide-y divide-border overflow-y-auto">
          {#each data.activities as activity}
            <li class="relative px-5 py-3 pl-8 text-xs before:absolute before:left-4 before:top-[18px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
              <div class="font-semibold">{activityLabels[activity.activityType] ?? activity.activityType}</div>
              {#if activityDetail(activity)}<p class="mt-1 whitespace-pre-wrap text-fg-muted">{activityDetail(activity)}</p>{/if}
              <div class="mt-1 font-mono text-[9px] text-fg-muted">{formatDate(activity.createdAt)} · {activity.actor}</div>
            </li>
          {/each}
        </ol>
      </section>
    </aside>
  </div>

  <section class="mt-5 overflow-hidden rounded-card border border-border bg-bg-card">
    <details>
      <summary class="cursor-pointer px-5 py-3 text-sm font-bold">Атрибуция и доставка событий</summary>
      <div class="grid grid-cols-3 border-t border-border text-xs max-md:grid-cols-1">
        <dl class="divide-y divide-border border-r border-border max-md:border-r-0"><div class="px-5 py-3"><dt class="text-fg-muted">Source / medium</dt><dd class="mt-1 break-all">{[data.row.utmSource, data.row.utmMedium].filter(Boolean).join(' / ') || '—'}</dd></div><div class="px-5 py-3"><dt class="text-fg-muted">Campaign</dt><dd class="mt-1 break-all">{data.row.utmCampaign || '—'}</dd></div><div class="px-5 py-3"><dt class="text-fg-muted">Campaign / ad set / ad ID</dt><dd class="mt-1 break-all font-mono">{[data.row.campaignId, data.row.adsetId, data.row.adId].filter(Boolean).join(' / ') || '—'}</dd></div></dl>
        <dl class="divide-y divide-border border-r border-border max-md:border-r-0"><div class="px-5 py-3"><dt class="text-fg-muted">Meta click/browser</dt><dd class="mt-1 break-all font-mono">{[data.row.fbclid, data.row.fbp, data.row.fbc].filter(Boolean).join(' / ') || '—'}</dd></div><div class="px-5 py-3"><dt class="text-fg-muted">Google click</dt><dd class="mt-1 break-all font-mono">{[data.row.gclid, data.row.gbraid, data.row.wbraid].filter(Boolean).join(' / ') || '—'}</dd></div><div class="px-5 py-3"><dt class="text-fg-muted">GA client / session</dt><dd class="mt-1 break-all font-mono">{[data.row.gaClientId, data.row.gaSessionId].filter(Boolean).join(' / ') || '—'}</dd></div></dl>
        <div><div class="border-b border-border px-5 py-3 text-fg-muted">Очередь Meta / Google</div>{#if data.deliveries.length === 0}<p class="px-5 py-4 text-fg-muted">Событий пока нет.</p>{:else}<ul class="divide-y divide-border">{#each data.deliveries as delivery}<li class="flex items-center justify-between gap-3 px-5 py-3"><div><div>{delivery.provider} · {delivery.eventName}</div><div class="mt-0.5 font-mono text-[9px] text-fg-muted">{deliveryStatusLabels[delivery.status] ?? delivery.status} · попыток {delivery.attemptCount}</div>{#if delivery.lastError}<div class="mt-1 text-[10px] text-danger">{delivery.lastError}</div>{/if}</div>{#if delivery.status === 'pending' || delivery.status === 'failed'}<form method="POST" action="?/retryDelivery"><input type="hidden" name="delivery_id" value={delivery.id} /><button class="rounded border border-border px-2 py-1 text-[10px] hover:border-accent" type="submit">Повторить</button></form>{/if}</li>{/each}</ul>{/if}</div>
      </div>
      <div class="border-t border-border px-5 py-3 text-[10px] text-fg-muted">Landing: {data.row.landingPage || '—'} · Privacy: {data.row.privacyVersion || 'legacy'} · analytics consent: {data.row.analyticsConsent ? 'yes' : 'no'}</div>
    </details>
  </section>

  <form method="POST" action="?/delete" class="mt-5" on:submit={handleDeleteSubmit}><button type="submit" class="rounded border border-danger/60 px-3 py-1.5 text-xs text-danger hover:bg-danger/10">Удалить заявку</button></form>
</div>

<DeleteConfirmationModal open={deleteModalOpen} form={pendingDeleteForm} onclose={closeDeleteModal} onconfirm={confirmDelete} />
