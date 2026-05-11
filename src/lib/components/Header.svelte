<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getLocaleForUrl, localizeHref, deLocalizeHref } from '$lib/paraglide/runtime';
  import {
    nav_home, nav_process, nav_pricing, nav_benefits, nav_faq, nav_contacts, nav_cta,
    brand_tagline, contacts_phone, contacts_phone_href, contacts_whatsapp
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  const LANGUAGES = [
    { code: 'ru', label: 'Русский', short: 'RU' },
    { code: 'ee', label: 'Eesti',   short: 'EE' }
  ] as const;

  let scrolled = false;
  let menuOpen = false;
  let langOpen = false;
  let langRef: HTMLDivElement;
  let langRefMobile: HTMLDivElement;

  $: currentLocale = getLocaleForUrl($page.url.href);
  $: current = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0];
  $: navItems = [
    { href: '#hero',     label: nav_home() },
    { href: '#process',  label: nav_process() },
    { href: '#pricing',  label: nav_pricing() },
    { href: '#benefits', label: nav_benefits() },
    { href: '#faq',      label: nav_faq() },
    { href: '#contacts', label: nav_contacts() }
  ];

  const setLang = (code: 'ru' | 'ee') => {
    langOpen = false;
    menuOpen = false;
    window.location.href = localizeHref(deLocalizeHref($page.url.pathname), { locale: code });
  };

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
      if (wasMobile && !isMobile)      { wasMenuOpen = menuOpen; menuOpen = false; }
      else if (!wasMobile && isMobile) { menuOpen = wasMenuOpen; }
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
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-[background,border-color,box-shadow] duration-250
    {scrolled ? 'bg-bg/75 backdrop-blur-md border-white/10 shadow-[0_2px_16px_rgba(0,0,0,.3)]' : ''}"
>
  <!-- Desktop bar -->
  <div class="container flex items-center gap-5 py-3.5 px-6 max-xs:py-5 max-xs:px-4">
    <a href="/" class="flex flex-col leading-[1.05] shrink-0" on:click={closeMenu}>
      <span class="font-black text-[22px] tracking-[0.02em] after:content-['.'] after:text-accent">DPFLAB</span>
      <span class="text-[9px] tracking-[0.18em] text-fg-muted uppercase mt-0.5">{brand_tagline()}</span>
    </a>

    <nav class="hidden lg:flex gap-[18px] shrink-0 max-xl:gap-[14px]" aria-label="Main">
      {#each navItems as it}
        <a href={it.href}
           class="text-[14px] max-xl:text-[12.5px] whitespace-nowrap text-fg-muted hover:text-fg transition-colors relative
                  after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-accent after:transition-[width]
                  hover:after:w-full">
          {it.label}
        </a>
      {/each}
    </nav>

    <div class="hidden lg:flex items-center gap-3.5 max-xl:gap-2.5 ml-auto shrink-0">
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
                        class:text-accent={l.code === currentLocale}
                        on:click={() => setLang(l.code)} role="option" aria-selected={l.code === currentLocale}>
                  <span class="font-bold text-[11px] tracking-widest bg-white/[.08] px-1.5 py-0.5 rounded min-w-[28px] text-center"
                        class:bg-accent={l.code === currentLocale}
                        class:text-accent-fg={l.code === currentLocale}>{l.short}</span>
                  <span class="flex-1">{l.label}</span>
                  {#if l.code === currentLocale}<Icon name="check" size={14}/>{/if}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <a href={contacts_phone_href()} class="text-[14px] max-xl:text-[13px] font-semibold whitespace-nowrap">{contacts_phone()}</a>
      <a href={contacts_whatsapp()} target="_blank" rel="noreferrer"
         class="inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[13px] px-3.5 py-[9px] rounded-btn whitespace-nowrap hover:bg-accent-h transition-colors">
        <Icon name="whatsapp" size={16}/> {nav_cta()}
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
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
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
                            class:text-accent={l.code === currentLocale}
                            on:click={() => setLang(l.code)} role="option" aria-selected={l.code === currentLocale}>
                      <span class="font-bold text-[11px] tracking-widest bg-white/[.08] px-1.5 py-0.5 rounded min-w-[28px] text-center"
                            class:bg-accent={l.code === currentLocale}
                            class:text-accent-fg={l.code === currentLocale}>{l.short}</span>
                      <span class="flex-1">{l.label}</span>
                      {#if l.code === currentLocale}<Icon name="check" size={14}/>{/if}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <a href={contacts_phone_href()} class="text-[14px] font-semibold">{contacts_phone()}</a>
        </div>
        <a href={contacts_whatsapp()} target="_blank" rel="noreferrer"
           class="flex items-center justify-center gap-2 w-full bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn hover:bg-accent-h transition-colors">
          <Icon name="whatsapp" size={16}/> {nav_cta()}
        </a>
      </div>
    </div>
  {/if}
</header>
