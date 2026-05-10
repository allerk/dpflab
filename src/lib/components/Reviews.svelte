<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="reviews" class="section reviews">
  <div class="container">
    <h2 class="section-title">{t.reviews.title}</h2>
    <div class="reviews-grid">
      {#each t.reviews.items as r}
        <div class="card review-card">
          <div class="review-stars">
            {#each Array(r.stars) as _}
              <Icon name="star" size={16}/>
            {/each}
          </div>
          <p class="review-text">{r.text}</p>
          <p class="review-author">{r.author}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
