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

  let deleteModalOpen = false;
  let pendingDeleteForm: HTMLFormElement | null = null;
  let allowDelete = false;

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
    <div class="text-sm text-fg-muted">{formatDate(data.row.createdAt)}</div>
  </div>

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
        <dt class="text-xs text-fg-muted">Content / Term</dt>
        <dd class="mt-1 break-all">{[data.row.utmContent, data.row.utmTerm].filter(Boolean).join(' / ') || '—'}</dd>
      </div>
      <div class="px-5 py-3 border-b border-border">
        <dt class="text-xs text-fg-muted">fbclid</dt>
        <dd class="mt-1 break-all font-mono text-xs">{data.row.fbclid || '—'}</dd>
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
