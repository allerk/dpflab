<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="benefits" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">
      {t.benefits.title} <span class="text-accent">{t.benefits.titleAccent}</span>
    </h2>

    <div class="grid grid-cols-5 gap-6 max-md:grid-cols-2 max-md:gap-y-7 max-md:gap-x-4 max-xs:grid-cols-1">
      {#each t.benefits.items as b}
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 flex items-center justify-center mb-3.5 text-fg">
            <Icon name={b.icon} size={36}/>
          </div>
          <p class="text-[13px] m-0 max-w-[160px] leading-snug text-fg-muted">{b.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
