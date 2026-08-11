<script lang="ts">
  import {
    hero_title_words, hero_title_accent, hero_subtitle, hero_cta_primary,
    hero_badge_1_title, hero_badge_1_text, hero_badge_2_title, hero_badge_2_text,
    hero_badge_3_title, hero_badge_3_text, hero_image_alt
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';
  import { publicImageUrl } from '$lib/image-url';
  import { asset } from '$app/paths';
  import { trackMetaEvent } from '$lib/analytics';

  export let image: string | null = null;
  export let locale: string = 'ru';

  const badgeIcons = ['clock', 'shield', 'truck'];
  const CURRENT_HERO_FILENAME = 'E5470B3C-B3BA-461A-8393-FC02A1EC1AF7.PNG';

  $: titleWords = hero_title_words().split('|');
  $: accentWord = hero_title_accent();
  $: imageSrc = publicImageUrl(image);
  $: useOptimizedHero = !image || Boolean(image.includes(CURRENT_HERO_FILENAME));
  $: badges = [
    { icon: badgeIcons[0], title: hero_badge_1_title(), text: hero_badge_1_text() },
    { icon: badgeIcons[1], title: hero_badge_2_title(), text: hero_badge_2_text() },
    { icon: badgeIcons[2], title: hero_badge_3_title(), text: hero_badge_3_text() }
  ];
</script>

<section id="hero" class="hero-section">
  <div class="hero-matrix" aria-hidden="true"></div>
  <div class="container hero-layout">
    <div class="hero-copy">
      <div class="hero-kicker" aria-hidden="true">
        <span>DPFLAB</span>
        <span class="hero-kicker-line"></span>
        <span>DPF / FAP</span>
      </div>

      <h1 class="hero-title">
        {#each titleWords as w, i}{#if i > 0}{' '}{/if}<span class="hero-title-word" class:hero-title-accent={w === accentWord}>{w}</span>{/each}
      </h1>
      <p class="hero-subtitle">{hero_subtitle()}</p>

      <div class="hero-actions">
        <a href="#contacts"
           on:click={() => trackMetaEvent('LeadFormIntent', { placement: 'hero', locale })}
           class="hero-cta">
          <span>{hero_cta_primary()}</span>
          <span class="hero-cta-icon" aria-hidden="true"><Icon name="arrow-right" size={18}/></span>
        </a>
      </div>
    </div>

    <div class="hero-facts">
      {#each badges as b}
        <div class="hero-fact">
          <span class="hero-fact-icon"><Icon name={b.icon} size={19}/></span>
          <div>
            <div class="hero-fact-title">{b.title}</div>
            <div class="hero-fact-text">{b.text}</div>
          </div>
        </div>
      {/each}
    </div>

    <div class="hero-media">
      <div class="hero-media-frame">
        {#if useOptimizedHero}
          <picture>
            <source
              media="(max-width: 600px)"
              srcset={asset('/hero-dpf-640.webp')}
              width="640"
              height="480"
            />
            <img
              src={asset('/hero-dpf-1000.webp')}
              alt={hero_image_alt()}
              width="1000"
              height="750"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </picture>
        {:else if imageSrc}
          <img
            src={imageSrc}
            alt={hero_image_alt()}
            width="1200"
            height="900"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        {:else}
          <div class="placeholder hero-placeholder">
            [ {hero_image_alt()} ]<br/>
            <span style="opacity:.6">1200×900 · фото DPF</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .hero-section {
    --hero-ink: #101513;
    --hero-muted: #59615c;
    --hero-ceramic: #e8ebe4;
    --hero-rule: #b7bdb5;
    position: relative;
    overflow: hidden;
    padding: clamp(3rem, 6vw, 5.75rem) 0 clamp(3.5rem, 7vw, 6.5rem);
    color: var(--hero-ink);
    background:
      linear-gradient(115deg, rgba(255, 255, 255, .42), transparent 46%),
      var(--hero-ceramic);
    isolation: isolate;
  }

  .hero-section::after {
    position: absolute;
    z-index: -1;
    top: 0;
    right: clamp(1rem, 6vw, 7rem);
    width: clamp(.75rem, 1.2vw, 1.1rem);
    height: 100%;
    content: '';
    background: var(--color-accent);
    opacity: .92;
  }

  .hero-matrix {
    position: absolute;
    z-index: -1;
    top: -12%;
    right: -5%;
    width: min(46vw, 680px);
    height: 124%;
    background-image: radial-gradient(circle, rgba(16, 21, 19, .22) 1.4px, transparent 1.6px);
    background-size: 14px 14px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 28%, #000 82%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 28%, #000 82%, transparent);
    opacity: .62;
    transform: skewX(-8deg);
  }

  .hero-layout {
    display: grid;
    grid-template-areas:
      'copy media'
      'facts media';
    grid-template-columns: minmax(0, 1.08fr) minmax(360px, .92fr);
    column-gap: clamp(2.5rem, 6vw, 6.5rem);
    row-gap: clamp(2.25rem, 5vw, 4rem);
    align-items: center;
  }

  .hero-copy {
    grid-area: copy;
    min-width: 0;
    align-self: end;
  }

  .hero-kicker {
    display: flex;
    align-items: center;
    gap: .75rem;
    margin-bottom: 1.35rem;
    color: #353d38;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: .7rem;
    font-weight: 750;
    letter-spacing: .18em;
  }

  .hero-kicker-line {
    width: 2.6rem;
    height: 1px;
    background: currentColor;
  }

  .hero-title {
    max-width: 100%;
    margin: 0 0 1.65rem;
    color: var(--hero-ink);
    font-family: 'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(2.35rem, 5.1vw, 4.45rem);
    font-stretch: condensed;
    font-weight: 900;
    hyphens: none;
    letter-spacing: -.055em;
    line-height: .91;
    text-transform: uppercase;
  }

  .hero-title :global(.hero-title-accent) {
    position: relative;
    z-index: 0;
    white-space: nowrap;
  }

  .hero-title :global(.hero-title-word) {
    display: inline-block;
    white-space: nowrap;
  }

  .hero-title :global(.hero-title-accent)::after {
    position: absolute;
    z-index: -1;
    right: -.07em;
    bottom: .04em;
    left: -.07em;
    height: .3em;
    content: '';
    background: var(--color-accent);
  }

  .hero-subtitle {
    max-width: 34rem;
    margin: 0 0 2rem;
    color: var(--hero-muted);
    font-size: clamp(.98rem, 1.3vw, 1.12rem);
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: .75rem;
  }

  .hero-cta {
    display: inline-grid;
    grid-template-columns: 1fr auto;
    min-width: min(100%, 17rem);
    align-items: center;
    border: 1px solid var(--hero-ink);
    color: #fff;
    background: var(--hero-ink);
    font-size: .92rem;
    font-weight: 750;
    text-decoration: none;
    transition: color .18s ease, background .18s ease, transform .18s ease;
  }

  .hero-cta > span:first-child {
    padding: .9rem 1.1rem;
  }

  .hero-cta-icon {
    display: grid;
    width: 3.1rem;
    align-self: stretch;
    place-items: center;
    color: var(--hero-ink);
    background: var(--color-accent);
  }

  .hero-cta:hover {
    color: var(--hero-ink);
    background: transparent;
    transform: translateY(-2px);
  }

  .hero-cta:focus-visible {
    outline: 3px solid var(--hero-ink);
    outline-offset: 4px;
  }

  .hero-facts {
    display: grid;
    grid-area: facts;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-self: start;
    border-top: 1px solid var(--hero-rule);
    border-bottom: 1px solid var(--hero-rule);
  }

  .hero-fact {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .72rem;
    min-width: 0;
    padding: 1rem .9rem 1rem 0;
  }

  .hero-fact + .hero-fact {
    border-left: 1px solid var(--hero-rule);
    padding-left: .9rem;
  }

  .hero-fact-icon {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border: 1px solid #7d867f;
    color: var(--hero-ink);
    background: rgba(255, 255, 255, .3);
  }

  .hero-fact-title {
    margin-bottom: .15rem;
    font-size: .78rem;
    font-weight: 800;
    line-height: 1.25;
  }

  .hero-fact-text {
    color: var(--hero-muted);
    font-size: .68rem;
    line-height: 1.35;
  }

  .hero-media {
    position: relative;
    grid-area: media;
    min-width: 0;
    align-self: stretch;
    padding: clamp(1rem, 2.5vw, 2rem) 0 clamp(1.35rem, 3vw, 2.8rem);
  }

  .hero-media::before,
  .hero-media::after {
    position: absolute;
    z-index: -1;
    content: '';
  }

  .hero-media::before {
    inset: 0 8% 0 -7%;
    border: 1px solid rgba(16, 21, 19, .35);
  }

  .hero-media::after {
    right: -1rem;
    bottom: 0;
    width: 38%;
    height: 2px;
    background: var(--hero-ink);
  }

  .hero-media-frame {
    aspect-ratio: 4 / 3;
    padding: .55rem;
    background: var(--hero-ink);
    clip-path: polygon(0 0, 91% 0, 100% 9%, 100% 100%, 9% 100%, 0 91%);
  }

  .hero-media-frame picture,
  .hero-media-frame img,
  .hero-placeholder {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hero-media-frame img {
    object-fit: cover;
    clip-path: polygon(0 0, 91% 0, 100% 9%, 100% 100%, 9% 100%, 0 91%);
  }

  @media (max-width: 900px) {
    .hero-layout {
      grid-template-areas:
        'copy'
        'media'
        'facts';
      grid-template-columns: minmax(0, 1fr);
    }

    .hero-title {
      max-width: 15ch;
    }

    .hero-media {
      width: min(100%, 44rem);
      justify-self: center;
    }

    .hero-matrix {
      width: 75vw;
    }
  }

  @media (max-width: 600px) {
    .hero-section {
      padding-top: 2.4rem;
    }

    .hero-section::after {
      right: .7rem;
      width: .45rem;
    }

    .hero-title {
      max-width: 100%;
      font-size: clamp(1.9rem, 8.7vw, 3.05rem);
      overflow-wrap: normal;
    }

    .hero-facts {
      grid-template-columns: 1fr;
    }

    .hero-fact {
      padding: .9rem 0;
    }

    .hero-fact + .hero-fact {
      border-top: 1px solid var(--hero-rule);
      border-left: 0;
      padding-left: 0;
    }

    .hero-cta {
      width: 100%;
    }

    .hero-media {
      padding-right: .85rem;
    }

    .hero-media::before {
      inset: .35rem 1.6rem .35rem -.5rem;
    }
  }
</style>
