<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
  let openSet = new Set<number>([0]);
  const toggle = (i: number) => {
    openSet.has(i) ? openSet.delete(i) : openSet.add(i);
    openSet = openSet;
  };
</script>

<section id="faq" class="section faq">
  <div class="container faq-container">
    <h2 class="section-title">{t.faq.title} <span class="accent">{t.faq.titleAccent}</span></h2>
    <div class="faq-list">
      {#each t.faq.items as it, i}
        {@const isOpen = openSet.has(i)}
        <div class="faq-item" class:open={isOpen}>
          <button class="faq-q" on:click={() => toggle(i)} aria-expanded={isOpen}>
            <span>{it.q}</span>
            <Icon name={isOpen ? 'minus' : 'plus'} size={20}/>
          </button>
          <div class="faq-a-wrap">
            <p class="faq-a">{it.a}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
