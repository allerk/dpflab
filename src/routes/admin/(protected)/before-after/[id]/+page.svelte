<script lang="ts">
  import ImagePicker from '$lib/components/admin/ImagePicker.svelte';
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
        disabled
        type="checkbox"
        name="slider_enabled"
        bind:checked={sliderEnabled}
        class="accent-accent w-4 h-4"
      />
      <span class="line-through text-sm">
        {admin_before_after_slider()} -
        {sliderEnabled ? admin_before_after_slider_on() : admin_before_after_slider_off()}
      </span>
      <span class="font-bold">- временно не работает</span>
    </label>

    {#if sliderEnabled}
      <div class="grid grid-cols-2 gap-4">
        <ImagePicker
          id="edit-image-before"
          name="image_before"
          label={admin_before_after_image_before()}
          value={data.row.imageBefore ?? ''}
          images={data.images}
        />
        <ImagePicker
          id="edit-image-after"
          name="image_after"
          label={admin_before_after_image_after()}
          value={data.row.imageAfter ?? ''}
          images={data.images}
        />
      </div>
    {:else}
      <ImagePicker
        id="edit-image-single"
        name="image_before"
        label={admin_before_after_image_single()}
        value={data.row.imageBefore ?? ''}
        images={data.images}
      />
      <input type="hidden" name="image_after" value="" />
    {/if}

    <p class="text-xs text-fg-muted">
      Upload files on the <a href="/admin/images" class="text-accent underline">Images</a> page to add them to the list.
    </p>

    <button
      type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-bg font-semibold text-sm cursor-pointer"
    >
      {admin_action_save()}
    </button>
  </form>
</div>
