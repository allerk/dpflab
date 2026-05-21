<script lang="ts">
  import {
    admin_before_after_title,
    admin_before_after_slider,
    admin_before_after_slider_on,
    admin_before_after_slider_off,
    admin_before_after_image_before,
    admin_before_after_image_after,
    admin_before_after_image_single,
    admin_action_save,
    admin_action_back
  } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;

  let sliderEnabled = data.row.sliderEnabled;
</script>

<div class="max-w-2xl">
  <a href="/admin/before-after" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>
  <h1 class="text-2xl font-bold mb-6">{admin_before_after_title()} — #{data.row.id}</h1>

  <form method="POST" class="bg-bg-card rounded-card p-5 border border-border space-y-5">
    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        name="slider_enabled"
        bind:checked={sliderEnabled}
        class="accent-accent w-4 h-4"
      />
      <span class="text-sm">
        {admin_before_after_slider()} —
        {sliderEnabled ? admin_before_after_slider_on() : admin_before_after_slider_off()}
      </span>
    </label>

    {#if sliderEnabled}
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="edit-image-before" class="block text-sm mb-1">{admin_before_after_image_before()}</label>
          {#if data.row.imageBefore}
            <img src="/images/{data.row.imageBefore}" alt="before" class="w-full h-28 object-cover rounded mb-2 bg-bg" />
          {/if}
          <input
            id="edit-image-before"
            type="text"
            name="image_before"
            value={data.row.imageBefore ?? ''}
            placeholder="filename.jpg"
            class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label for="edit-image-after" class="block text-sm mb-1">{admin_before_after_image_after()}</label>
          {#if data.row.imageAfter}
            <img src="/images/{data.row.imageAfter}" alt="after" class="w-full h-28 object-cover rounded mb-2 bg-bg" />
          {/if}
          <input
            id="edit-image-after"
            type="text"
            name="image_after"
            value={data.row.imageAfter ?? ''}
            placeholder="filename.jpg"
            class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
          />
        </div>
      </div>
    {:else}
      <div>
        <label for="edit-image-single" class="block text-sm mb-1">{admin_before_after_image_single()}</label>
        {#if data.row.imageBefore}
          <img src="/images/{data.row.imageBefore}" alt="preview" class="w-full max-h-48 object-contain rounded mb-2 bg-bg" />
        {/if}
        <input
          id="edit-image-single"
          type="text"
          name="image_before"
          value={data.row.imageBefore ?? ''}
          placeholder="filename.jpg"
          class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
        />
        <input type="hidden" name="image_after" value="" />
      </div>
    {/if}

    <p class="text-xs text-fg-muted">
      Upload files on the <a href="/admin/images" class="text-accent underline">Images</a> page, then paste the filename here.
    </p>

    <button
      type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-bg font-semibold text-sm cursor-pointer"
    >
      {admin_action_save()}
    </button>
  </form>
</div>
