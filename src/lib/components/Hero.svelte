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
  $: useOptimizedHero = Boolean(image?.includes(CURRENT_HERO_FILENAME));
  $: badges = [
    { icon: badgeIcons[0], title: hero_badge_1_title(), text: hero_badge_1_text() },
    { icon: badgeIcons[1], title: hero_badge_2_title(), text: hero_badge_2_text() },
    { icon: badgeIcons[2], title: hero_badge_3_title(), text: hero_badge_3_text() }
  ];
</script>

<section id="hero" class="relative py-14 pb-20 overflow-hidden
  bg-[radial-gradient(1200px_500px_at_80%_50%,rgba(126,211,33,.08),transparent_60%)]
  max-sm:py-8 max-sm:pb-12">
  <div class="container grid grid-cols-[1.1fr_1fr] gap-[60px] items-center max-md:grid-cols-1 max-md:gap-8">

    <div class="min-w-0">
      <h1 class="text-[clamp(24px,7.5vw,60px)] font-black leading-[1.02] tracking-[-0.01em] mb-6 hyphens-auto">
        {#each titleWords as w, i}{#if i > 0}{' '}{/if}<span class:text-accent={w === accentWord}>{w}</span>{/each}
      </h1>
      <p class="text-[17px] text-fg-muted max-w-[520px] mb-8 max-sm:text-[15px]">{hero_subtitle()}</p>

      <div class="flex gap-3 flex-wrap mb-12 max-xs:flex-col">
        <a href="#contacts"
           on:click={() => trackMetaEvent('LeadFormIntent', { placement: 'hero', locale })}
           class="inline-flex items-center justify-center gap-2 bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn whitespace-nowrap hover:bg-accent-h hover:-translate-y-px transition-[background,transform] max-xs:w-full">
          {hero_cta_primary()}
        </a>
      </div>

      <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3.5">
        {#each badges as b}
          <div class="flex gap-3 items-start">
            <span class="w-10 h-10 rounded-full border border-accent text-accent flex items-center justify-center shrink-0">
              <Icon name={b.icon} size={20}/>
            </span>
            <div>
              <div class="font-semibold text-[14px] mb-0.5">{b.title}</div>
              <div class="text-[12px] text-fg-muted leading-snug">{b.text}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="min-w-0 aspect-[4/3]">
      {#if useOptimizedHero}
        <picture class="block h-full">
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
            class="w-full h-full object-cover rounded-card"
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
          class="w-full h-full object-cover rounded-card"
        />
      {:else}
        <div class="placeholder w-full h-full">
          [ {hero_image_alt()} ]<br/>
          <span style="opacity:.6">1200×900 · фото DPF</span>
        </div>
      {/if}
    </div>
  </div>
</section>
