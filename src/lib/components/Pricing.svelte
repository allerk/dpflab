<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="pricing" class="section pricing">
  <div class="container">
    <h2 class="section-title">{t.pricing.title} <span class="accent">{t.pricing.titleAccent}</span></h2>
    <div class="pricing-grid">
      {#each t.pricing.items as it}
        <div class="card pricing-card">
          <div class="pricing-icon"><Icon name={it.icon} size={32}/></div>
          <h3 class="pricing-card-title">{it.title}</h3>
          <div class="pricing-price">{it.price}</div>
          <a href="#contacts" class="btn btn-primary btn-block">{it.cta}</a>
        </div>
      {/each}
    </div>
    <p class="pricing-footer">{t.pricing.footer}</p>
  </div>
</section>
