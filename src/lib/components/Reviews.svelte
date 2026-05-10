<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="reviews" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">{t.reviews.title}</h2>
    <div class="grid grid-cols-3 gap-5 max-md:grid-cols-1">
      {#each t.reviews.items as r}
        <div class="bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] hover:shadow-[0_8px_28px_rgba(0,0,0,.4)] hover:-translate-y-[3px] transition-[transform,box-shadow] duration-200 px-6 py-[22px] flex flex-col gap-3">
          <div class="flex gap-0.5 text-accent">
            {#each Array(r.stars) as _}<Icon name="star" size={16}/>{/each}
          </div>
          <p class="text-[14px] text-fg-muted m-0 leading-relaxed">{r.text}</p>
          <p class="text-[13px] font-semibold m-0">{r.author}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
