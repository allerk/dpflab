<script lang="ts">
  import {
    gallery_title, gallery_label_before, gallery_label_after,
    gallery_pair_1_before, gallery_pair_1_after, gallery_pair_2_before, gallery_pair_2_after,
    gallery_pair_3_before, gallery_pair_3_after, gallery_pair_4_before, gallery_pair_4_after,
    gallery_pair_5_before, gallery_pair_5_after
  } from '$lib/paraglide/messages';
  import BeforeAfterCard from './BeforeAfterCard.svelte';

  $: pairs = [
    { before: gallery_pair_1_before(), after: gallery_pair_1_after() },
    { before: gallery_pair_2_before(), after: gallery_pair_2_after() },
    { before: gallery_pair_3_before(), after: gallery_pair_3_after() },
    { before: gallery_pair_4_before(), after: gallery_pair_4_after() },
    { before: gallery_pair_5_before(), after: gallery_pair_5_after() }
  ];
</script>

<section id="gallery" class="section bg-bg">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">{gallery_title()}</h2>
    <div class="grid grid-cols-5 gap-3 max-md:grid-cols-2 max-xs:grid-cols-1">
      {#each pairs as p}
        <BeforeAfterCard before={p.before} after={p.after} labelBefore={gallery_label_before()} labelAfter={gallery_label_after()} />
      {/each}
    </div>
  </div>
</section>
