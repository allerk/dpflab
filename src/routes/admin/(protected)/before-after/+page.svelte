<script lang="ts">
  import { onMount } from 'svelte';
  import ImagePicker from '$lib/components/admin/ImagePicker.svelte';
  import {
    admin_before_after_title,
    admin_before_after_add,
    admin_before_after_slider,
    admin_before_after_slider_on,
    admin_before_after_slider_off,
    admin_before_after_image_before,
    admin_before_after_image_after,
    admin_before_after_image_single,
    admin_action_edit,
    admin_action_delete,
    admin_action_add,
    admin_confirm_delete,
    admin_no_items
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: rows = (form as { rows?: typeof data.rows } | null)?.rows ?? data.rows;

  let sliderEnabled = true;

  onMount(() => {
    document.querySelectorAll<HTMLFormElement>('form[data-confirm]').forEach((f) => {
      f.addEventListener('submit', (e) => {
        if (!confirm(f.dataset.confirm)) e.preventDefault();
      });
    });
  });
</script>

<div class="max-w-3xl">
  <h1 class="text-2xl font-bold mb-6">{admin_before_after_title()}</h1>

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
              <button
                type="submit"
                disabled={i === 0}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move up">↑</button
              >
            </form>
            <form method="POST" action="?/moveDown">
              <input type="hidden" name="id" value={row.id} />
              <button
                type="submit"
                disabled={i === rows.length - 1}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move down">↓</button
              >
            </form>
          </div>

          <div class="flex gap-2 shrink-0">
            {#if row.imageBefore}
              <img src="/images/{row.imageBefore}" alt="before" class="w-10 h-10 object-cover rounded bg-bg" />
            {:else}
              <div class="w-10 h-10 rounded border border-dashed border-border bg-bg flex items-center justify-center text-fg-muted text-xs">?</div>
            {/if}
            {#if row.sliderEnabled}
              {#if row.imageAfter}
                <img src="/images/{row.imageAfter}" alt="after" class="w-10 h-10 object-cover rounded bg-bg" />
              {:else}
                <div class="w-10 h-10 rounded border border-dashed border-border bg-bg flex items-center justify-center text-fg-muted text-xs">?</div>
              {/if}
            {/if}
          </div>

          <span class="flex-1 text-sm text-fg-muted">
            {row.sliderEnabled ? admin_before_after_slider_on() : admin_before_after_slider_off()}
          </span>

          <a
            href="/admin/before-after/{row.id}"
            class="text-sm px-3 py-1.5 rounded-btn border border-border hover:bg-bg transition-colors shrink-0"
          >
            {admin_action_edit()}
          </a>

          <form
            method="POST"
            action="?/delete"
            data-confirm={admin_confirm_delete()}
          >
            <input type="hidden" name="id" value={row.id} />
            <button
              type="submit"
              class="text-sm px-3 py-1.5 rounded-btn border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              {admin_action_delete()}
            </button>
          </form>
        </div>
      {/each}
    </div>
  {/if}

  <div class="bg-bg-card rounded-card p-5 border border-border">
    <h2 class="font-semibold mb-4">{admin_before_after_add()}</h2>
    <form method="POST" action="?/create" class="space-y-4">
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" name="slider_enabled" bind:checked={sliderEnabled} class="accent-accent w-4 h-4" />
        <span class="text-sm">{admin_before_after_slider()}</span>
      </label>
      {#if sliderEnabled}
        <div class="grid grid-cols-2 gap-4">
          <ImagePicker
            id="new-image-before"
            name="image_before"
            label={admin_before_after_image_before()}
            images={data.images}
          />
          <ImagePicker
            id="new-image-after"
            name="image_after"
            label={admin_before_after_image_after()}
            images={data.images}
          />
        </div>
      {:else}
        <ImagePicker
          id="new-image-before"
          name="image_before"
          label={admin_before_after_image_single()}
          images={data.images}
        />
      {/if}
      <p class="text-xs text-fg-muted">
        Upload files on the <a href="/admin/images" class="text-accent underline">Images</a> page to add them to the list.
      </p>
      <button
        type="submit"
        class="px-4 py-2 rounded-btn bg-accent text-bg font-semibold text-sm cursor-pointer"
      >
        {admin_action_add()}
      </button>
    </form>
  </div>
</div>
