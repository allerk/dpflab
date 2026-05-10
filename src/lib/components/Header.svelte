<script lang="ts">
  import { onMount } from 'svelte';
  import { lang } from '$lib/stores';
  import type { ContentBundle, Locale } from '$lib/types';
  import Icon from '$lib/Icon.svelte';

  export let t: ContentBundle;

  const LANGUAGES: { code: Locale; label: string; short: string }[] = [
    { code: 'ru', label: 'Русский', short: 'RU' },
    { code: 'ee', label: 'Eesti', short: 'EE' }
  ];

  let scrolled = false;
  let menuOpen = false;
  let langOpen = false;
  let langRef: HTMLDivElement;
  let langRefMobile: HTMLDivElement;

  $: current = LANGUAGES.find((l) => l.code === $lang) || LANGUAGES[0];

  $: navItems = [
    { href: '#hero', label: t.nav.home },
    { href: '#process', label: t.nav.process },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#benefits', label: t.nav.benefits },
    { href: '#faq', label: 'FAQ' },
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
      if (wasMobile && !isMobile) { wasMenuOpen = menuOpen; menuOpen = false; }
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
  const setLang = (code: Locale) => {
    lang.set(code);
    langOpen = false;
  };
</script>

<header class="site-header" class:is-scrolled={scrolled}>
  <div class="container header-inner">
    <a href="#hero" class="brand" on:click={closeMenu}>
      <span class="brand-name">{t.brand.name}</span>
      <span class="brand-tag">{t.brand.tagline}</span>
    </a>

    <nav class="nav hide-mobile" aria-label="Main">
      {#each navItems as it}
        <a href={it.href} class="nav-link">{it.label}</a>
      {/each}
    </nav>

    <div class="header-actions hide-mobile">
      <div class="lang-dropdown" bind:this={langRef}>
        <button class="lang-trigger" on:click={() => (langOpen = !langOpen)} aria-haspopup="listbox" aria-expanded={langOpen}>
          <Icon name="globe" size={14} />
          <span>{current.short}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        {#if langOpen}
          <ul class="lang-menu" role="listbox">
            {#each LANGUAGES as l}
              <li>
                <button class="lang-option" class:active={l.code === $lang} on:click={() => setLang(l.code)} role="option" aria-selected={l.code === $lang}>
                  <span class="lang-option-short">{l.short}</span>
                  <span class="lang-option-label">{l.label}</span>
                  {#if l.code === $lang}<Icon name="check" size={14} />{/if}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      <a href={t.contacts.phoneHref} class="header-phone">{t.contacts.phone}</a>
      <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">
        <Icon name="whatsapp" size={16}/> {t.nav.cta}
      </a>
    </div>

    <button class="burger show-mobile" aria-label="Menu" on:click={() => (menuOpen = !menuOpen)}>
      <Icon name={menuOpen ? 'close' : 'menu'} />
    </button>
  </div>

  <div class="mobile-drawer" class:open={menuOpen}>
    <nav class="mobile-nav" on:click={closeMenu}>
      {#each navItems as it}
        <a href={it.href} class="mobile-link">{it.label}</a>
      {/each}
    </nav>
    <div class="mobile-meta">
      <div class="mobile-meta-row">
        <div class="lang-dropdown lang-dropdown--left" bind:this={langRefMobile}>
          <button class="lang-trigger" on:click={() => (langOpen = !langOpen)} aria-haspopup="listbox" aria-expanded={langOpen}>
            <Icon name="globe" size={14} />
            <span>{current.short}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          {#if langOpen}
            <ul class="lang-menu" role="listbox">
              {#each LANGUAGES as l}
                <li>
                  <button class="lang-option" class:active={l.code === $lang} on:click={() => setLang(l.code)} role="option" aria-selected={l.code === $lang}>
                    <span class="lang-option-short">{l.short}</span>
                    <span class="lang-option-label">{l.label}</span>
                    {#if l.code === $lang}<Icon name="check" size={14} />{/if}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        <a href={t.contacts.phoneHref} class="header-phone">{t.contacts.phone}</a>
      </div>
      <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer" class="btn btn-primary btn-block">
        <Icon name="whatsapp" size={16}/> {t.nav.cta}
      </a>
    </div>
  </div>
</header>
