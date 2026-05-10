<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="why" class="section why">
  <div class="container why-grid">
    <div>
      <h2 class="why-title">{t.why.title}</h2>
      <p class="why-lead">{t.why.lead}</p>
      <ul class="why-list">
        {#each t.why.points as p}
          <li class="why-item"><span class="why-x"><Icon name="cross" size={20}/></span><span>{p}</span></li>
        {/each}
      </ul>
      <p class="why-footer">{t.why.footer}</p>
    </div>
    <div class="why-image">
      <div class="placeholder why-placeholder">
        [ {t.why.imageAlt} ]<br/>
        <span style="opacity:.6">фото DPF: до / после</span>
      </div>
    </div>
  </div>
</section>
