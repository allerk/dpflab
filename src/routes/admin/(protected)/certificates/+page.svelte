<script lang="ts">
  import { onMount } from 'svelte';
  import {
    admin_certificates_title,
    admin_certificates_add,
    admin_certificates_title_ru,
    admin_certificates_title_et,
    admin_certificates_text_ru,
    admin_certificates_text_et,
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

  onMount(() => {
    document.querySelectorAll<HTMLFormElement>('form[data-confirm]').forEach((f) => {
      f.addEventListener('submit', (e) => {
        if (!confirm(f.dataset.confirm)) e.preventDefault();
      });
    });
  });
</script>

<div class="max-w-3xl">
  <h1 class="text-2xl font-bold mb-6">{admin_certificates_title()}</h1>

  {#if rows.length === 0}
    <p class="text-fg-muted text-sm mb-6">{admin_no_items()}</p>
  {:else}
    <div class="border border-border rounded-card overflow-hidden mb-8">
      {#each rows as row, i}
        <div class="flex items-center gap-3 px-4 py-3 bg-bg-card {i < rows.length - 1 ? 'border-b border-border' : ''}">
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

          <span class="flex-1 text-sm truncate">{row.titleRu}</span>

          <a href="/admin/certificates/{row.id}"
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
    <h2 class="font-semibold mb-4">{admin_certificates_add()}</h2>
    <form method="POST" action="?/create" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="title_ru" class="block text-sm font-medium mb-1">{admin_certificates_title_ru()}</label>
          <input id="title_ru" name="title_ru" type="text" value={form?.values?.titleRu ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.title_ru}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="title_et" class="block text-sm font-medium mb-1">{admin_certificates_title_et()}</label>
          <input id="title_et" name="title_et" type="text" value={form?.values?.titleEt ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.title_et}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="text_ru" class="block text-sm font-medium mb-1">{admin_certificates_text_ru()}</label>
          <textarea id="text_ru" name="text_ru" rows="2"
            value={form?.values?.textRu ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"></textarea>
          {#if form?.errors?.text_ru}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="text_et" class="block text-sm font-medium mb-1">{admin_certificates_text_et()}</label>
          <textarea id="text_et" name="text_et" rows="2"
            value={form?.values?.textEt ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"></textarea>
          {#if form?.errors?.text_et}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
      </div>
      <button type="submit"
        class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
        {admin_action_add()}
      </button>
    </form>
  </div>
</div>

