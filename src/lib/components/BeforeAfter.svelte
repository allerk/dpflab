<script lang="ts">
  import { gallery_title, gallery_label_before, gallery_label_after } from '$lib/paraglide/messages';
  import BeforeAfterCard from './BeforeAfterCard.svelte';
  import type { BeforeAfterRow } from '$lib/db/repositories/before-after';

  export let items: BeforeAfterRow[] = [];
</script>

{#if items.length > 0}
  <section id="gallery" class="section bg-bg">
    <div class="container">
      <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">{gallery_title()}</h2>
      <div class="flex flex-wrap justify-center gap-3">
        {#each items as item}
          <div class="w-[calc(20%-9.6px)] max-md:w-[calc(50%-6px)] max-xs:w-full">
            <BeforeAfterCard
              sliderEnabled={item.sliderEnabled}
              imageBefore={item.imageBefore}
              imageAfter={item.imageAfter}
              labelBefore={gallery_label_before()}
              labelAfter={gallery_label_after()}
            />
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}
