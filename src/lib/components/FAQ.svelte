<script lang="ts">
  import { faq_title, faq_title_accent } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';
  import type { FaqItem } from '$lib/db/repositories/faq';

  export let items: FaqItem[] = [];

  let openSet = new Set<number>([0]);
  const toggle = (i: number) => {
    openSet.has(i) ? openSet.delete(i) : openSet.add(i);
    openSet = openSet;
  };
</script>

<section id="faq" class="section bg-bg">
  <div class="container max-w-[820px]">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">
      {faq_title()} <span class="text-accent">{faq_title_accent()}</span>
    </h2>
    <div class="flex flex-col gap-2.5">
      {#each items as it, i}
        {@const isOpen = openSet.has(i)}
        <div class="faq-item bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] overflow-hidden transition-[border-color] border border-transparent"
             class:border-accent={isOpen} class:open={isOpen}>
          <button class="w-full bg-transparent border-0 text-fg flex items-center justify-between gap-4 px-[22px] py-[18px] text-[15px] font-semibold text-left"
                  on:click={() => toggle(i)} aria-expanded={isOpen}>
            <span>{it.question}</span>
            <Icon name={isOpen ? 'minus' : 'plus'} size={20}/>
          </button>
          <div class="faq-a-wrap">
            <p class="px-[22px] pb-[18px] m-0 text-fg-muted text-[14px] leading-relaxed">{it.answer}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
