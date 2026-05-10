<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="pricing" class="section bg-bg">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">
      {t.pricing.title} <span class="text-accent">{t.pricing.titleAccent}</span>
    </h2>

    <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1">
      {#each t.pricing.items as it}
        <div class="bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] hover:shadow-[0_8px_28px_rgba(0,0,0,.4)] hover:-translate-y-[3px] transition-[transform,box-shadow] duration-200 px-7 py-8 flex flex-col items-center text-center">
          <div class="w-14 h-14 rounded-full border border-border text-accent flex items-center justify-center mb-4">
            <Icon name={it.icon} size={32}/>
          </div>
          <h3 class="text-[16px] font-semibold mb-4">{it.title}</h3>
          <div class="text-[32px] font-extrabold mb-6">{it.price}</div>
          <a href="#contacts"
             class="flex items-center justify-center w-full bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn whitespace-nowrap hover:bg-accent-h hover:-translate-y-px transition-[background,transform]">
            {it.cta}
          </a>
        </div>
      {/each}
    </div>

    <p class="text-center text-[13px] text-fg-muted mt-8">{t.pricing.footer}</p>
  </div>
</section>
