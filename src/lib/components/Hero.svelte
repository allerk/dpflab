<script lang="ts">
  import {
    hero_title_words, hero_subtitle, hero_cta_primary, hero_cta_secondary,
    hero_badge_1_title, hero_badge_1_text, hero_badge_2_title, hero_badge_2_text,
    hero_badge_3_title, hero_badge_3_text, hero_image_alt,
    contacts_whatsapp
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  const badgeIcons = ['clock', 'shield', 'truck'];

  $: titleWords = hero_title_words().split('|');
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
      <h1 class="text-[clamp(24px,7.5vw,60px)] font-black leading-[1.02] tracking-[-0.01em] mb-6">
        {#each titleWords as w, i}{#if i > 0}{' '}{/if}<span class:text-accent={w === 'DPF'}>{w}</span>{/each}
      </h1>
      <p class="text-[17px] text-fg-muted max-w-[520px] mb-8 max-sm:text-[15px]">{hero_subtitle()}</p>

      <div class="flex gap-3 flex-wrap mb-12 max-xs:flex-col">
        <a href="#contacts"
           class="inline-flex items-center justify-center gap-2 bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn whitespace-nowrap hover:bg-accent-h hover:-translate-y-px transition-[background,transform] max-xs:w-full">
          {hero_cta_primary()}
        </a>
        <a href={contacts_whatsapp()} target="_blank" rel="noreferrer"
           class="inline-flex items-center justify-center gap-2 bg-white/[.08] text-fg border border-white/[.18] font-semibold text-[15px] px-6 py-3.5 rounded-btn whitespace-nowrap hover:bg-white/[.14] hover:-translate-y-px transition-[background,transform] max-xs:w-full">
          <Icon name="whatsapp" size={16}/> {hero_cta_secondary()}
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
      <div class="placeholder w-full h-full">
        [ {hero_image_alt()} ]<br/>
        <span style="opacity:.6">1200×900 · фото DPF</span>
      </div>
    </div>
  </div>
</section>
