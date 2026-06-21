<script lang="ts">
  import { onMount } from 'svelte';
  import {
    admin_pricing_title,
    admin_pricing_add,
    admin_pricing_icon,
    admin_pricing_title_ru,
    admin_pricing_title_et,
    admin_pricing_price,
    admin_pricing_cta_ru,
    admin_pricing_cta_et,
    admin_action_add,
    admin_action_edit,
    admin_action_delete,
    admin_confirm_delete,
    admin_no_items,
    admin_error_required
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: rows = data.rows;

  const ICONS = [
    'clock','shield','truck','phone','search','drop','report','filter',
    'scope','bolt','machine','car','handshake','check','mail','map',
    'whatsapp','star','globe','award'
  ];

  onMount(() => {
    document.querySelectorAll<HTMLFormElement>('form[data-confirm]').forEach((f) => {
      f.addEventListener('submit', (e) => {
        if (!confirm(f.dataset.confirm)) e.preventDefault();
      });
    });
  });
</script>

<div class="max-w-3xl">
  <h1 class="text-2xl font-bold mb-6">{admin_pricing_title()}</h1>

  {#if rows.length === 0}
    <p class="text-fg-muted text-sm mb-6">{admin_no_items()}</p>
  {:else}
    <div class="border border-border rounded-card overflow-hidden mb-8">
      {#each rows as row, i}
        <div
          class="flex items-center gap-3 px-4 py-3 bg-bg-card {i < rows.length - 1
            ? 'border-b border-border'
            : ''}"
        >
          <div class="flex flex-col gap-1 mr-1">
            <form method="POST" action="?/moveUp">
              <input type="hidden" name="id" value={row.id} />
              <button type="submit" disabled={i === 0}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move up">↑</button>
            </form>
            <form method="POST" action="?/moveDown">
              <input type="hidden" name="id" value={row.id} />
              <button type="submit" disabled={i === rows.length - 1}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move down">↓</button>
            </form>
          </div>

          <code class="text-xs bg-bg px-1.5 py-0.5 rounded border border-border w-20 shrink-0 truncate">{row.icon}</code>
          <span class="flex-1 text-sm truncate">{row.titleRu} — {row.price}</span>

          <a href="/admin/pricing/{row.id}"
            class="text-sm px-3 py-1.5 rounded-btn border border-border hover:bg-bg transition-colors">
            {admin_action_edit()}
          </a>

          <form method="POST" action="?/delete" data-confirm={admin_confirm_delete()}>
            <input type="hidden" name="id" value={row.id} />
            <button type="submit"
              class="text-sm px-3 py-1.5 rounded-btn border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer">
              {admin_action_delete()}
            </button>
          </form>
        </div>
      {/each}
    </div>
  {/if}

  <div class="bg-bg-card border border-border rounded-card p-5">
    <h2 class="font-semibold mb-4">{admin_pricing_add()}</h2>
    <form method="POST" action="?/create" class="space-y-4">
      <div>
        <label for="icon" class="block text-sm font-medium mb-1">{admin_pricing_icon()}</label>
        <select
          id="icon"
          name="icon"
          class="px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent"
        >
          {#each ICONS as icon}
            <option value={icon} selected={form?.values?.icon === icon}>{icon}</option>
          {/each}
        </select>
        {#if form?.errors?.icon}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="title_ru" class="block text-sm font-medium mb-1">{admin_pricing_title_ru()}</label>
          <input id="title_ru" name="title_ru" type="text" value={form?.values?.titleRu ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.title_ru}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="title_et" class="block text-sm font-medium mb-1">{admin_pricing_title_et()}</label>
          <input id="title_et" name="title_et" type="text" value={form?.values?.titleEt ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.title_et}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="cta_ru" class="block text-sm font-medium mb-1">{admin_pricing_cta_ru()}</label>
          <input id="cta_ru" name="cta_ru" type="text" value={form?.values?.ctaRu ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.cta_ru}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="cta_et" class="block text-sm font-medium mb-1">{admin_pricing_cta_et()}</label>
          <input id="cta_et" name="cta_et" type="text" value={form?.values?.ctaEt ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.cta_et}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
      </div>

      <div>
        <label for="price" class="block text-sm font-medium mb-1">{admin_pricing_price()}</label>
        <input id="price" name="price" type="text" value={form?.values?.price ?? ''}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.price}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>

      <button type="submit"
        class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
        {admin_action_add()}
      </button>
    </form>
  </div>
</div>

