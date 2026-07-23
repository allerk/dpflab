<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CookieConsent from '$lib/components/CookieConsent.svelte';
  import { getLocale } from '$lib/paraglide/runtime';
  import {
    privacy_analytics_text,
    privacy_analytics_title,
    privacy_back,
    privacy_controller_text,
    privacy_controller_title,
    privacy_data_text,
    privacy_data_title,
    privacy_intro,
    privacy_meta_title,
    privacy_purpose_text,
    privacy_purpose_title,
    privacy_recipients_text,
    privacy_recipients_title,
    privacy_retention_text,
    privacy_retention_title,
    privacy_rights_text,
    privacy_rights_title,
    privacy_title,
    privacy_updated
  } from '$lib/paraglide/messages';

  const BASE_URL = 'https://dpflab.ee';
  const locale = getLocale();
  const homeHref = locale === 'ru' ? '/' : `/${locale}`;
  const canonicalUrl = locale === 'ru' ? `${BASE_URL}/privacy` : `${BASE_URL}/${locale}/privacy`;

  const sections = [
    { title: privacy_controller_title, text: privacy_controller_text },
    { title: privacy_data_title, text: privacy_data_text },
    { title: privacy_purpose_title, text: privacy_purpose_text },
    { title: privacy_analytics_title, text: privacy_analytics_text },
    { title: privacy_recipients_title, text: privacy_recipients_text },
    { title: privacy_retention_title, text: privacy_retention_text },
    { title: privacy_rights_title, text: privacy_rights_text }
  ];
</script>

<svelte:head>
  <title>{privacy_meta_title()}</title>
  <meta name="description" content={privacy_intro()} />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="ru" href="{BASE_URL}/privacy" />
  <link rel="alternate" hreflang="et" href="{BASE_URL}/et/privacy" />
  <link rel="alternate" hreflang="en" href="{BASE_URL}/en/privacy" />
  <link rel="alternate" hreflang="x-default" href="{BASE_URL}/privacy" />
</svelte:head>

<Header />

<main class="min-h-screen">
  <section class="section border-b border-border bg-bg-elev">
    <div class="container grid grid-cols-[minmax(0,1fr)_280px] gap-12 items-end max-md:grid-cols-1 max-md:gap-7">
      <div>
        <div class="font-mono text-[11px] tracking-[0.18em] text-accent mb-4">DPFLAB / PRIVACY / 2026</div>
        <h1 class="text-[clamp(34px,6vw,68px)] leading-[0.98] font-black tracking-[-0.035em] max-w-[850px]">
          {privacy_title()}
        </h1>
        <p class="mt-6 max-w-[720px] text-[17px] leading-relaxed text-fg-muted">{privacy_intro()}</p>
      </div>

      <div class="border-l-2 border-accent pl-5 py-1 font-mono text-[12px] leading-relaxed text-fg-muted">
        <div class="text-fg font-bold">Motorlab OÜ / DPFLAB</div>
        <div>Saha-Loo tee 36</div>
        <div>Iru, 74206, Estonia</div>
        <a href="mailto:info@dpflab.ee" class="text-accent hover:underline">info@dpflab.ee</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container grid grid-cols-[190px_minmax(0,760px)] gap-14 max-md:grid-cols-1 max-md:gap-7">
      <aside class="font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">
        <div class="sticky top-28">
          <div>{privacy_updated()}</div>
          <div class="mt-3 h-px bg-border"></div>
        </div>
      </aside>

      <div class="divide-y divide-border">
        {#each sections as section, index}
          <article class="grid grid-cols-[44px_1fr] gap-5 py-8 first:pt-0 max-xs:grid-cols-1 max-xs:gap-2">
            <div class="font-mono text-[12px] text-accent">{String(index + 1).padStart(2, '0')}</div>
            <div>
              <h2 class="text-[22px] font-extrabold mb-3">{section.title()}</h2>
              <p class="text-[15px] leading-[1.75] text-fg-muted">{section.text()}</p>
              {#if index === sections.length - 1}
                <a
                  href="https://www.aki.ee"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex mt-4 text-[13px] font-semibold text-accent hover:underline"
                >
                  Andmekaitse Inspektsioon ↗
                </a>
              {/if}
            </div>
          </article>
        {/each}

        <div class="pt-8">
          <a
            href={homeHref}
            class="inline-flex items-center gap-2 border border-border rounded-btn px-4 py-2.5 text-[14px] font-semibold hover:border-accent hover:text-accent transition-colors"
          >
            ← {privacy_back()}
          </a>
        </div>
      </div>
    </div>
  </section>
</main>

<Footer {locale} />
<CookieConsent />
