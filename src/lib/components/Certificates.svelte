<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
  const icons = ['award', 'shield', 'check', 'report'];
</script>

<section id="certificates" class="section certificates">
  <div class="container">
    <h2 class="section-title">{t.certificates.title} <span class="accent">{t.certificates.titleAccent}</span></h2>
    <div class="certs-grid">
      {#each t.certificates.items as c, i}
        <div class="card cert-card">
          <div class="cert-icon"><Icon name={icons[i % icons.length]} size={28}/></div>
          <h3 class="cert-title">{c.title}</h3>
          <p class="cert-text">{c.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
