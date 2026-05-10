<script lang="ts">
  import { onMount } from 'svelte';
  import { lang } from '$lib/stores';
  import type { ContentBundle, Locale } from '$lib/types';
  import Icon from '$lib/Icon.svelte';

  export let t: ContentBundle;

  const LANGUAGES: { code: Locale; label: string; short: string }[] = [
    { code: 'ru', label: 'Русский', short: 'RU' },
    { code: 'ee', label: 'Eesti',   short: 'EE' }
  ];

  let scrolled = false;
  let menuOpen = false;
  let langOpen = false;
  let langRef: HTMLDivElement;
  let langRefMobile: HTMLDivElement;

  $: current = LANGUAGES.find((l) => l.code === $lang) || LANGUAGES[0];
  $: navItems = [
    { href: '#hero',     label: t.nav.home },
    { href: '#process',  label: t.nav.process },
    { href: '#pricing',  label: t.nav.pricing },
    { href: '#benefits', label: t.nav.benefits },
    { href: '#faq',      label: 'FAQ' },
    { href: '#contacts', label: t.nav.contacts }
  ];

  onMount(() => {
    const onScroll = () => (scrolled = window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const onClick = (e: MouseEvent) => {
      if (langOpen && langRef && langRefMobile &&
          !langRef.contains(e.target as Node) &&
          !langRefMobile.contains(e.target as Node)) langOpen = false;
    };
    document.addEventListener('mousedown', onClick);

    let wasMenuOpen = false;
    let wasMobile = window.innerWidth <= 1060;
    const onResize = () => {
      const isMobile = window.innerWidth <= 1060;
      if (wasMobile && !isMobile)       { wasMenuOpen = menuOpen; menuOpen = false; }
      else if (!wasMobile && isMobile)  { menuOpen = wasMenuOpen; }
      wasMobile = isMobile;
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onClick);
    };
  });

  const closeMenu = () => (menuOpen = false);
  const setLang = (code: Locale) => { lang.set(code); langOpen = false; };
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-[background,border-color,box-shadow] duration-250
    {scrolled ? 'bg-bg/92 backdrop-blur-md border-border shadow-[0_2px_16px_rgba(0,0,0,.3)]' : ''}"
>
  <!-- Desktop bar -->
  <div class="container flex items-center gap-5 py-3.5 px-6">
    <a href="#hero" class="flex flex-col leading-[1.05] shrink-0" on:click={closeMenu}>
      <span class="font-black text-[22px] tracking-wide after:content-['.'] after:text-accent">{t.brand.name}</span>
      <span class="text-[9px] tracking-[0.18em] text-fg-muted uppercase mt-0.5">{t.brand.tagline}</span>
    </a>

    <nav class="hidden lg:flex gap-[18px] shrink-0" aria-label="Main">
      {#each navItems as it}
        <a href={it.href}
           class="text-[14px] text-fg-muted hover:text-fg transition-colors relative
                  after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-accent after:transition-[width]
                  hover:after:w-full">
          {it.label}
        </a>
      {/each}
    </nav>

    <div class="hidden lg:flex items-center gap-3.5 ml-auto shrink-0">
      <!-- Lang dropdown -->
      <div class="relative" bind:this={langRef}>
        <button
          class="inline-flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1.5 text-[12px] font-semibold tracking-widest hover:border-accent transition-colors"
          on:click={() => (langOpen = !langOpen)}
          aria-haspopup="listbox" aria-expanded={langOpen}
        >
          <Icon name="globe" size={14}/><span>{current.short}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        {#if langOpen}
          <ul class="absolute top-[calc(100%+6px)] right-0 min-w-[160px] bg-bg-elev border border-border rounded-card shadow-[0_8px_24px_rgba(0,0,0,.4)] list-none m-0 p-1.5 z-[60]" role="listbox">
            {#each LANGUAGES as l}
              <li>
                <button class="w-full flex items-center gap-2.5 bg-transparent border-0 text-fg px-2.5 py-2 text-[13px] text-left rounded-md transition-colors hover:bg-white/[.06]"
                        class:text-accent={l.code === $lang}
                        on:click={() => setLang(l.code)} role="option" aria-selected={l.code === $lang}>
                  <span class="font-bold text-[11px] tracking-widest bg-white/[.08] px-1.5 py-0.5 rounded min-w-[28px] text-center"
                        class:bg-accent={l.code === $lang}
                        class:text-accent-fg={l.code === $lang}>{l.short}</span>
                  <span class="flex-1">{l.label}</span>
                  {#if l.code === $lang}<Icon name="check" size={14}/>{/if}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <a href={t.contacts.phoneHref} class="text-[14px] font-semibold whitespace-nowrap">{t.contacts.phone}</a>
      <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer"
         class="inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[13px] px-3.5 py-2.5 rounded-btn hover:bg-accent-h transition-colors">
        <Icon name="whatsapp" size={16}/> {t.nav.cta}
      </a>
    </div>

    <!-- Burger -->
    <button class="lg:hidden ml-auto p-1.5 text-fg" aria-label="Menu" on:click={() => (menuOpen = !menuOpen)}>
      <Icon name={menuOpen ? 'close' : 'menu'} />
    </button>
  </div>

  <!-- Mobile drawer -->
  {#if menuOpen}
    <div class="lg:hidden flex flex-col bg-bg-elev border-t border-border px-6 pt-4 pb-6 gap-4">
      <nav class="flex flex-col" on:click={closeMenu}>
        {#each navItems as it}
          <a href={it.href} class="py-3 border-b border-border text-[16px]">{it.label}</a>
        {/each}
      </nav>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3.5">
          <div class="relative" bind:this={langRefMobile}>
            <button
              class="inline-flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1.5 text-[12px] font-semibold tracking-widest hover:border-accent transition-colors"
              on:click={() => (langOpen = !langOpen)}
              aria-haspopup="listbox" aria-expanded={langOpen}
            >
              <Icon name="globe" size={14}/><span>{current.short}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            {#if langOpen}
              <ul class="absolute top-[calc(100%+6px)] left-0 min-w-[160px] bg-bg-elev border border-border rounded-card shadow-[0_8px_24px_rgba(0,0,0,.4)] list-none m-0 p-1.5 z-[60]" role="listbox">
                {#each LANGUAGES as l}
                  <li>
                    <button class="w-full flex items-center gap-2.5 bg-transparent border-0 text-fg px-2.5 py-2 text-[13px] text-left rounded-md transition-colors hover:bg-white/[.06]"
                            class:text-accent={l.code === $lang}
                            on:click={() => setLang(l.code)} role="option" aria-selected={l.code === $lang}>
                      <span class="font-bold text-[11px] tracking-widest bg-white/[.08] px-1.5 py-0.5 rounded min-w-[28px] text-center"
                            class:bg-accent={l.code === $lang}
                            class:text-accent-fg={l.code === $lang}>{l.short}</span>
                      <span class="flex-1">{l.label}</span>
                      {#if l.code === $lang}<Icon name="check" size={14}/>{/if}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <a href={t.contacts.phoneHref} class="text-[14px] font-semibold">{t.contacts.phone}</a>
        </div>
        <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer"
           class="flex items-center justify-center gap-2 w-full bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn hover:bg-accent-h transition-colors">
          <Icon name="whatsapp" size={16}/> {t.nav.cta}
        </a>
      </div>
    </div>
  {/if}
</header>
