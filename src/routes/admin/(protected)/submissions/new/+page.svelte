<script lang="ts">
  import type { ActionData } from './$types';

  export let form: ActionData;

  const inputClass =
    'w-full rounded-input border border-border bg-bg px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent';

  const previous = (key: string, fallback = '') =>
    String((form?.values as Record<string, unknown> | undefined)?.[key] ?? fallback);
</script>

<svelte:head><title>Новая заявка — DPFLAB CRM</title></svelte:head>

<div class="mx-auto max-w-4xl">
  <a href="/admin/submissions" class="mb-5 inline-flex text-sm text-fg-muted hover:text-fg">← CRM</a>

  <header class="mb-7 flex items-end justify-between gap-5 max-sm:items-start">
    <div>
      <div class="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Входящий канал / вручную</div>
      <h1 class="text-3xl">Новая заявка</h1>
      <p class="mt-2 max-w-xl text-sm text-fg-muted">Для звонка, рекомендации, визита или переписки WhatsApp. Совпадения по телефону и e-mail CRM покажет до сохранения.</p>
    </div>
    <div class="h-10 w-1.5 shrink-0 rounded-full bg-accent"></div>
  </header>

  {#if form?.duplicateWarning}
    <aside class="mb-5 rounded-card border border-amber-400/50 bg-amber-400/10 p-4">
      <h2 class="text-sm text-amber-300">Похожий контакт уже есть</h2>
      <p class="mt-1 text-xs text-fg-muted">Откройте существующую карточку или подтвердите, что это новая заявка.</p>
      <div class="mt-3 flex flex-wrap gap-2">
        {#each form.duplicates ?? [] as duplicate}
          <a class="rounded border border-border bg-bg px-3 py-2 text-xs hover:border-accent" href="/admin/submissions/{duplicate.id}">
            #{duplicate.id} · {duplicate.name} · {duplicate.status}
          </a>
        {/each}
      </div>
    </aside>
  {/if}

  <form method="POST" class="overflow-hidden rounded-card border border-border bg-bg-card">
    <div class="grid grid-cols-2 gap-5 p-6 max-sm:grid-cols-1">
      <div>
        <label for="origin" class="mb-1.5 block text-xs text-fg-muted">Канал *</label>
        <select id="origin" name="origin" class={inputClass} value={previous('origin', 'whatsapp')}>
          <option value="whatsapp">WhatsApp</option>
          <option value="manual">Звонок / визит / другое</option>
        </select>
      </div>
      <div>
        <label for="source" class="mb-1.5 block text-xs text-fg-muted">Источник</label>
        <input id="source" name="source" maxlength="120" value={previous('source')} placeholder="Рекомендация, Google Maps, постоянный клиент…" class={inputClass} />
      </div>

      <div>
        <label for="name" class="mb-1.5 block text-xs text-fg-muted">Имя / компания *</label>
        <input id="name" name="name" maxlength="100" required value={previous('name')} class={inputClass} />
        {#if form?.errors?.name}<p class="mt-1 text-xs text-danger">{form.errors.name}</p>{/if}
      </div>
      <div>
        <label for="assigned_to" class="mb-1.5 block text-xs text-fg-muted">Ответственный</label>
        <input id="assigned_to" name="assigned_to" maxlength="160" value={previous('assignedTo')} placeholder="Имя сотрудника" class={inputClass} />
      </div>

      <div>
        <label for="phone" class="mb-1.5 block text-xs text-fg-muted">Телефон</label>
        <input id="phone" name="phone" inputmode="tel" maxlength="40" value={previous('phone')} placeholder="+372 …" class={inputClass} />
        {#if form?.errors?.phone}<p class="mt-1 text-xs text-danger">{form.errors.phone}</p>{/if}
      </div>
      <div>
        <label for="email" class="mb-1.5 block text-xs text-fg-muted">E-mail</label>
        <input id="email" name="email" type="email" maxlength="160" value={previous('email')} class={inputClass} />
        {#if form?.errors?.email}<p class="mt-1 text-xs text-danger">{form.errors.email}</p>{/if}
      </div>

      <div>
        <label for="service_type" class="mb-1.5 block text-xs text-fg-muted">Услуга *</label>
        <select id="service_type" name="service_type" required class={inputClass} value={previous('serviceType', 'dpf')}>
          <option value="dpf">Очистка DPF</option>
          <option value="fap">Очистка FAP</option>
          <option value="catalyst">Катализатор / DOC / SCR</option>
          <option value="diagnosis">Диагностика</option>
          <option value="other">Нужно уточнить</option>
        </select>
      </div>
      <div>
        <label for="client_type" class="mb-1.5 block text-xs text-fg-muted">Тип клиента</label>
        <select id="client_type" name="client_type" class={inputClass} value={previous('clientType')}>
          <option value="">Не указан</option>
          <option value="private">Владелец автомобиля</option>
          <option value="workshop">Автосервис</option>
          <option value="fleet">Компания / автопарк</option>
        </select>
      </div>

      <div>
        <label for="filter_state" class="mb-1.5 block text-xs text-fg-muted">Где фильтр сейчас? *</label>
        <select id="filter_state" name="filter_state" required class={inputClass} value={previous('filterState', 'installed')}>
          <option value="installed">На автомобиле — нужен партнёр</option>
          <option value="removed">Уже снят — привезут в DPFLAB</option>
          <option value="workshop">В другом автосервисе — нужен забор</option>
          <option value="unsure">Неясно — сначала диагностика</option>
        </select>
        {#if form?.errors?.filterState}<p class="mt-1 text-xs text-danger">{form.errors.filterState}</p>{/if}
      </div>
      <div>
        <label for="registration_number" class="mb-1.5 block text-xs text-fg-muted">Госномер автомобиля *</label>
        <input id="registration_number" name="registration_number" maxlength="40" required autocapitalize="characters" spellcheck="false" value={previous('registrationNumber')} placeholder="123 ABC" class={inputClass} />
        <p class="mt-1 text-[10px] leading-relaxed text-fg-muted">Нужен для точной идентификации машины и проверки подходящего фильтра.</p>
        {#if form?.errors?.registrationNumber}<p class="mt-1 text-xs text-danger">{form.errors.registrationNumber}</p>{/if}
      </div>

      <div class="col-span-2 max-sm:col-span-1">
        <label for="vehicle" class="mb-1.5 block text-xs text-fg-muted">Модель / двигатель, если уже известны</label>
        <input id="vehicle" name="vehicle" maxlength="240" value={previous('vehicle')} class={inputClass} />
      </div>
      <div class="col-span-2 max-sm:col-span-1">
        <label for="comment" class="mb-1.5 block text-xs text-fg-muted">Что договорились / запрос клиента</label>
        <textarea id="comment" name="comment" rows="4" maxlength="1500" class={inputClass}>{previous('comment')}</textarea>
      </div>
    </div>

    <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg px-6 py-4">
      {#if form?.duplicateWarning}
        <label class="flex items-center gap-2 text-xs text-amber-300">
          <input type="checkbox" name="confirm_duplicate" value="yes" required /> Это отдельная заявка
        </label>
      {:else}
        <span class="text-xs text-fg-muted">* обязательные поля</span>
      {/if}
      <button type="submit" class="rounded-btn bg-accent px-5 py-2.5 text-sm font-bold text-accent-fg hover:bg-accent-h">Создать карточку</button>
    </footer>
  </form>
</div>
