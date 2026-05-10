<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="benefits" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-black text-center tracking-wide mb-10">
      {t.benefits.title} <span class="text-accent">{t.benefits.titleAccent}</span>
    </h2>

    <div class="grid grid-cols-5 gap-6 max-sm:grid-cols-2 max-sm:gap-7 max-[480px]:grid-cols-1">
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
