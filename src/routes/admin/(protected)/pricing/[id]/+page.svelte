<script lang="ts">
  import {
    admin_pricing_title,
    admin_pricing_icon,
    admin_pricing_title_ru,
    admin_pricing_title_et,
    admin_pricing_title_en,
    admin_pricing_price,
    admin_pricing_cta_ru,
    admin_pricing_cta_et,
    admin_pricing_cta_en,
    admin_action_save,
    admin_action_back,
    admin_error_required
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: row = data.row;

  const ICONS = [
    'clock','shield','truck','phone','search','drop','report','filter',
    'scope','bolt','machine','car','handshake','check','mail','map',
    'whatsapp','star','globe','award'
  ];
</script>

<div class="max-w-2xl">
  <a href="/admin/pricing" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>
  <h1 class="text-2xl font-bold mb-6">{admin_pricing_title()} — #{row.id}</h1>

  <form method="POST" action="?/update" class="bg-bg-card border border-border rounded-card p-5 space-y-4">
    <div>
      <label for="icon" class="block text-sm font-medium mb-1">{admin_pricing_icon()}</label>
      <select id="icon" name="icon"
        class="px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent">
        {#each ICONS as icon}
          <option value={icon} selected={(form?.values?.icon ?? row.icon) === icon}>{icon}</option>
        {/each}
      </select>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label for="title_ru" class="block text-sm font-medium mb-1">{admin_pricing_title_ru()}</label>
        <input id="title_ru" name="title_ru" type="text" value={form?.values?.titleRu ?? row.titleRu}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.title_ru}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="title_et" class="block text-sm font-medium mb-1">{admin_pricing_title_et()}</label>
        <input id="title_et" name="title_et" type="text" value={form?.values?.titleEt ?? row.titleEt}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.title_et}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="title_en" class="block text-sm font-medium mb-1">{admin_pricing_title_en()}</label>
        <input id="title_en" name="title_en" type="text" value={form?.values?.titleEn ?? row.titleEn}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.title_en}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="cta_ru" class="block text-sm font-medium mb-1">{admin_pricing_cta_ru()}</label>
        <input id="cta_ru" name="cta_ru" type="text" value={form?.values?.ctaRu ?? row.ctaRu}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.cta_ru}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="cta_et" class="block text-sm font-medium mb-1">{admin_pricing_cta_et()}</label>
        <input id="cta_et" name="cta_et" type="text" value={form?.values?.ctaEt ?? row.ctaEt}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.cta_et}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="cta_en" class="block text-sm font-medium mb-1">{admin_pricing_cta_en()}</label>
        <input id="cta_en" name="cta_en" type="text" value={form?.values?.ctaEn ?? row.ctaEn}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.cta_en}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
    </div>

    <div>
      <label for="price" class="block text-sm font-medium mb-1">{admin_pricing_price()}</label>
      <input id="price" name="price" type="text" value={form?.values?.price ?? row.price}
        class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
      {#if form?.errors?.price}
        <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
      {/if}
    </div>

    <button type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
      {admin_action_save()}
    </button>
  </form>
</div>
