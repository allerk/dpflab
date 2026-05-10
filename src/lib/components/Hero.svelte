<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="hero" class="hero">
  <div class="container hero-grid">
    <div class="hero-text">
      <h1 class="hero-title">
        {#each t.hero.title as w, i}{#if i > 0}{' '}{/if}<span class:hero-accent={w === 'DPF'}>{w}</span>{/each}
      </h1>
      <p class="hero-sub">{t.hero.subtitle}</p>

      <div class="hero-ctas">
        <a href="#contacts" class="btn btn-primary">{t.hero.ctaPrimary}</a>
        <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer" class="btn btn-secondary">
          <Icon name="whatsapp" size={16}/> {t.hero.ctaSecondary}
        </a>
      </div>

      <div class="hero-badges">
        {#each t.hero.badges as b}
          <div class="hero-badge">
            <span class="hero-badge-icon"><Icon name={b.icon} size={20}/></span>
            <div>
              <div class="hero-badge-title">{b.title}</div>
              <div class="hero-badge-text">{b.text}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="hero-image">
      <div class="placeholder hero-placeholder">
        [ {t.hero.imageAlt} ]<br/>
        <span style="opacity:.6">1200×900 · фото DPF</span>
      </div>
    </div>
  </div>
</section>
