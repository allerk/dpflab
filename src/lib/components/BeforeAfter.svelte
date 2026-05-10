<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import BeforeAfterCard from './BeforeAfterCard.svelte';
  export let t: ContentBundle;
</script>

<section id="gallery" class="section bg-bg">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">{t.gallery.title}</h2>
    <div class="grid grid-cols-5 gap-3 max-md:grid-cols-2 max-xs:grid-cols-1">
      {#each t.gallery.pairs as p}
        <BeforeAfterCard before={p.before} after={p.after} labelBefore={t.gallery.labelBefore} labelAfter={t.gallery.labelAfter} />
      {/each}
    </div>
  </div>
</section>
