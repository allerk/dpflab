<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="benefits" class="section benefits">
  <div class="container">
    <h2 class="section-title">{t.benefits.title} <span class="accent">{t.benefits.titleAccent}</span></h2>
    <div class="benefits-grid">
      {#each t.benefits.items as b}
        <div class="benefit">
          <div class="benefit-icon"><Icon name={b.icon} size={36}/></div>
          <p class="benefit-text">{b.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
