<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import BeforeAfterCard from './BeforeAfterCard.svelte';
  export let t: ContentBundle;
</script>

<section id="gallery" class="section gallery">
  <div class="container">
    <h2 class="section-title">{t.gallery.title}</h2>
    <div class="gallery-grid">
      {#each t.gallery.pairs as p}
        <BeforeAfterCard before={p.before} after={p.after} labelBefore={t.gallery.labelBefore} labelAfter={t.gallery.labelAfter} />
      {/each}
    </div>
  </div>
</section>
