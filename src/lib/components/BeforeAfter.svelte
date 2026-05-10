<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import BeforeAfterCard from './BeforeAfterCard.svelte';
  export let t: ContentBundle;
</script>

<section id="gallery" class="section bg-bg">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-black text-center tracking-wide mb-10">{t.gallery.title}</h2>
    <div class="grid grid-cols-5 gap-3 max-sm:grid-cols-2 max-[480px]:grid-cols-1">
      {#each t.gallery.pairs as p}
        <BeforeAfterCard before={p.before} after={p.after} labelBefore={t.gallery.labelBefore} labelAfter={t.gallery.labelAfter} />
      {/each}
    </div>
  </div>
</section>
