<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="process" class="section process">
  <div class="container">
    <h2 class="section-title">{t.process.title} <span class="accent">{t.process.titleAccent}</span></h2>
    <div class="process-grid">
      <div class="process-line" aria-hidden="true"></div>
      {#each t.process.steps as s, i}
        <div class="process-step">
          <div class="process-icon">
            <Icon name={s.icon} size={28}/>
            <span class="process-num">{i + 1}</span>
          </div>
          <p class="process-text">{s.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
