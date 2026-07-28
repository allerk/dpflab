<script lang="ts">
  import DeleteConfirmationModal from '$lib/components/admin/DeleteConfirmationModal.svelte';
  import { admin_action_back, admin_action_delete } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;

  const labels: Record<string, Record<string, string>> = {
    clientType: {
      private: 'Владелец автомобиля',
      workshop: 'Автосервис',
      fleet: 'Компания / автопарк'
    },
    serviceType: {
      dpf: 'Очистка DPF',
      fap: 'Очистка FAP',
      catalyst: 'Катализатор / DOC / SCR',
      diagnosis: 'Диагностика',
      other: 'Не определено'
    },
    filterState: {
      removed: 'Фильтр уже снят',
      workshop: 'Фильтр в автосервисе',
      installed: 'Фильтр установлен на автомобиле',
      unsure: 'Нужна консультация'
    },
    urgency: {
      today: 'Сегодня',
      days_1_3: 'В течение 1–3 дней',
      this_week: 'На этой неделе',
      consultation: 'Пока консультация'
    },
    preferredContact: {
      phone: 'Телефон',
      whatsapp: 'WhatsApp',
      email: 'E-mail'
    },
    symptoms: {
      warning: 'Горит DPF / Check Engine',
      power: 'Пропала мощность',
      regeneration: 'Частая регенерация',
      smoke: 'Дым или запах',
      other: 'Другая проблема'
    }
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
  let pipelineStatus = data.row.status;

  $: symptoms = (() => {
    try {
      const parsed = JSON.parse(data.row.symptoms) as string[];
      return parsed.map((value) => labels.symptoms[value] ?? value);
    } catch {
      return data.row.symptoms ? [data.row.symptoms] : [];
    }
  })();

  function label(group: keyof typeof labels, value: string) {
    return labels[group][value] ?? (value || '—');
  }

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

<div class="max-w-4xl">
  <a href="/admin/submissions" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>

  <div class="flex items-end justify-between gap-4 mb-6">
    <div>
      <div class="font-mono text-xs text-accent mb-1">SITE LEAD / {data.row.locale.toUpperCase()}</div>
      <h1 class="text-2xl font-bold">Заявка #{data.row.id}</h1>
    </div>
    <div class="flex flex-col items-end gap-2">
      <span class="rounded-full border px-3 py-1 text-xs font-semibold {statusClasses[data.row.status] ?? statusClasses.new}">
        {statusLabels[data.row.status] ?? data.row.status}
      </span>
      <div class="text-sm text-fg-muted">{formatDate(data.row.createdAt)}</div>
    </div>
  </div>

  <section class="bg-bg-card border border-border rounded-card mb-5 overflow-hidden">
    <div class="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
      <div>
        <h2 class="text-sm font-bold">Пайплайн</h2>
        <p class="mt-0.5 text-xs text-fg-muted">Статус, ответственный и результат заявки</p>
      </div>
      {#if data.row.updatedAt}
        <span class="text-xs text-fg-muted">Обновлено {formatDate(data.row.updatedAt)}</span>
      {/if}
    </div>

    <form method="POST" action="?/pipeline" class="grid grid-cols-2 gap-4 p-5 max-md:grid-cols-1">
      <div>
        <label for="pipeline-status" class="mb-1.5 block text-xs font-medium text-fg-muted">Статус</label>
        <select
          id="pipeline-status"
          name="status"
          bind:value={pipelineStatus}
          class="w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {#each Object.entries(statusLabels) as [value, text]}
            <option {value}>{text}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="assigned-to" class="mb-1.5 block text-xs font-medium text-fg-muted">Ответственный</label>
        <input
          id="assigned-to"
          name="assigned_to"
          value={data.row.assignedTo}
          maxlength="160"
          placeholder="Имя или e-mail"
          class="w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label for="order-amount" class="mb-1.5 block text-xs font-medium text-fg-muted">Сумма заказа, €</label>
        <input
          id="order-amount"
          name="order_amount"
          inputmode="decimal"
          value={(data.row.orderAmountCents / 100).toFixed(2)}
          class="w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label for="loss-reason" class="mb-1.5 block text-xs font-medium text-fg-muted">Причина потери</label>
        <input
          id="loss-reason"
          name="loss_reason"
          value={data.row.lossReason}
          maxlength="500"
          required={pipelineStatus === 'lost'}
          placeholder="Обязательно для статуса «Проиграно»"
          class="w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div class="col-span-2 max-md:col-span-1">
        <label for="admin-notes" class="mb-1.5 block text-xs font-medium text-fg-muted">Рабочие заметки</label>
        <textarea
          id="admin-notes"
          name="admin_notes"
          rows="3"
          maxlength="3000"
          placeholder="Договоренности, следующий шаг, причина паузы"
          class="w-full resize-y rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        >{data.row.adminNotes}</textarea>
      </div>

      <div class="col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 max-md:col-span-1">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-muted">
          {#if data.row.firstContactedAt}<span>Связались: {formatDate(data.row.firstContactedAt)}</span>{/if}
          {#if data.row.qualifiedAt}<span>Квалифицирована: {formatDate(data.row.qualifiedAt)}</span>{/if}
          {#if data.row.bookedAt}<span>Записан: {formatDate(data.row.bookedAt)}</span>{/if}
          {#if data.row.completedAt}<span>Выполнено: {formatDate(data.row.completedAt)}</span>{/if}
          {#if data.row.lostAt}<span>Проиграно: {formatDate(data.row.lostAt)}</span>{/if}
        </div>
        <button type="submit" class="rounded-btn bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-h">
          Сохранить
        </button>
      </div>
    </form>
  </section>

  <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1">
    <section class="bg-bg-card border border-border rounded-card overflow-hidden">
      <h2 class="px-5 py-3 border-b border-border text-sm font-bold">Контакт</h2>
      <dl class="divide-y divide-border">
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Имя</dt>
          <dd class="mt-1">{data.row.name}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Телефон</dt>
          <dd class="mt-1"><a href="tel:{data.row.phone}" class="hover:text-accent">{data.row.phone}</a></dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">E-mail</dt>
          <dd class="mt-1">{#if data.row.email}<a href="mailto:{data.row.email}" class="hover:text-accent">{data.row.email}</a>{:else}—{/if}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Предпочтительный канал</dt>
          <dd class="mt-1">{label('preferredContact', data.row.preferredContact)}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Клиент</dt>
          <dd class="mt-1">{label('clientType', data.row.clientType)}</dd>
        </div>
      </dl>
    </section>

    <section class="bg-bg-card border border-border rounded-card overflow-hidden">
      <h2 class="px-5 py-3 border-b border-border text-sm font-bold">Задача</h2>
      <dl class="divide-y divide-border">
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Услуга</dt>
          <dd class="mt-1">{label('serviceType', data.row.serviceType)}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Состояние</dt>
          <dd class="mt-1">{label('filterState', data.row.filterState)}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Автомобиль / фильтр</dt>
          <dd class="mt-1 whitespace-pre-wrap break-words">{data.row.vehicle || '—'}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Срочность</dt>
          <dd class="mt-1">{label('urgency', data.row.urgency)}</dd>
        </div>
        <div class="px-5 py-3">
          <dt class="text-xs text-fg-muted">Симптомы</dt>
          <dd class="mt-1">{symptoms.length ? symptoms.join(' · ') : '—'}</dd>
        </div>
      </dl>
    </section>
  </div>

  <section class="bg-bg-card border border-border rounded-card mt-5 overflow-hidden">
    <h2 class="px-5 py-3 border-b border-border text-sm font-bold">Комментарий</h2>
    <p class="px-5 py-4 whitespace-pre-wrap break-words">{data.row.comment || '—'}</p>
  </section>

  <section class="bg-bg-card border border-border rounded-card mt-5 overflow-hidden">
    <h2 class="px-5 py-3 border-b border-border text-sm font-bold">Атрибуция</h2>
    <dl class="grid grid-cols-2 max-sm:grid-cols-1">
      <div class="px-5 py-3 border-b border-r border-border max-sm:border-r-0">
        <dt class="text-xs text-fg-muted">Source / Medium</dt>
        <dd class="mt-1 break-all">{[data.row.utmSource, data.row.utmMedium].filter(Boolean).join(' / ') || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-border">
        <dt class="text-xs text-fg-muted">Campaign</dt>
        <dd class="mt-1 break-all">{data.row.utmCampaign || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-r border-border max-sm:border-r-0">
        <dt class="text-xs text-fg-muted">UTM ID / Campaign ID</dt>
        <dd class="mt-1 break-all">{[data.row.utmId, data.row.campaignId].filter(Boolean).join(' / ') || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-border">
        <dt class="text-xs text-fg-muted">Ad set / Ad</dt>
        <dd class="mt-1 break-all">{[data.row.adsetId, data.row.adId].filter(Boolean).join(' / ') || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-r border-border max-sm:border-r-0">
        <dt class="text-xs text-fg-muted">Content / Term</dt>
        <dd class="mt-1 break-all">{[data.row.utmContent, data.row.utmTerm].filter(Boolean).join(' / ') || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-border">
        <dt class="text-xs text-fg-muted">fbclid</dt>
        <dd class="mt-1 break-all font-mono text-xs">{data.row.fbclid || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-r border-border max-sm:border-r-0">
        <dt class="text-xs text-fg-muted">fbp</dt>
        <dd class="mt-1 break-all font-mono text-xs">{data.row.fbp || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-border">
        <dt class="text-xs text-fg-muted">fbc</dt>
        <dd class="mt-1 break-all font-mono text-xs">{data.row.fbc || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-r border-border max-sm:border-r-0 max-sm:border-b">
        <dt class="text-xs text-fg-muted">Landing page</dt>
        <dd class="mt-1 break-all text-xs">{data.row.landingPage || '—'}</dd>
      </div>
      <div class="px-5 py-3">
        <dt class="text-xs text-fg-muted">Referrer</dt>
        <dd class="mt-1 break-all text-xs">{data.row.referrer || '—'}</dd>
      </div>
    </dl>
    <div class="px-5 py-3 border-t border-border text-xs text-fg-muted">
      Privacy: {data.row.privacyVersion || 'старая заявка'} · Analytics consent: {data.row.analyticsConsent ? 'yes' : 'no'}
    </div>
  </section>

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
