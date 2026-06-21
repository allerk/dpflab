<script lang="ts">
  import ImagePicker from '$lib/components/admin/ImagePicker.svelte';
  import {
    admin_site_images_title,
    admin_site_images_hero,
    admin_site_images_why,
    admin_site_images_contact,
    admin_site_images_hint,
    admin_action_save
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: map = (form as { siteImagesMap?: typeof data.siteImagesMap } | null)?.siteImagesMap ?? data.siteImagesMap;
  $: images = (form as { images?: typeof data.images } | null)?.images ?? data.images;
  $: savedKey = (form as { saved?: string } | null)?.saved;

  const slots = [
    { key: 'hero_main', label: () => admin_site_images_hero() },
    { key: 'why_main', label: () => admin_site_images_why() },
    { key: 'contact_workshop', label: () => admin_site_images_contact() }
  ] as const;
</script>

<div class="max-w-2xl">
  <h1 class="text-2xl font-bold mb-2">{admin_site_images_title()}</h1>
  <p class="text-sm text-fg-muted mb-8">{admin_site_images_hint()}</p>

  <div class="space-y-6">
    {#each slots as slot}
      {@const currentValue = map[slot.key] ?? ''}
      <div class="bg-bg-card rounded-card border border-border p-5">
        <div class="flex items-start gap-4 mb-4">
          {#if currentValue}
            <img
              src="/images/{currentValue}"
              alt=""
              class="w-24 h-16 object-cover rounded-card shrink-0 border border-border"
            />
          {:else}
            <div class="w-24 h-16 rounded-card border border-dashed border-border bg-bg flex items-center justify-center text-fg-muted text-xs shrink-0">
              —
            </div>
          {/if}
          <div>
            <div class="font-semibold text-sm mb-0.5">{slot.label()}</div>
            {#if savedKey === slot.key}
              <span class="text-xs text-accent">✓ Saved</span>
            {/if}
          </div>
        </div>

        <form method="POST" action="?/save" class="flex items-end gap-3">
          <input type="hidden" name="key" value={slot.key} />
          <div class="flex-1">
            <ImagePicker
              id="picker-{slot.key}"
              name="filename"
              label=""
              value={currentValue}
              {images}
            />
          </div>
          <button
            type="submit"
            class="px-4 py-2 rounded-btn bg-accent text-bg font-semibold text-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            {admin_action_save()}
          </button>
        </form>
      </div>
    {/each}
  </div>

  <p class="text-xs text-fg-muted mt-6">
    Upload files on the <a href="/admin/images" class="text-accent underline">Images</a> page first.
  </p>
</div>
