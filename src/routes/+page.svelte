<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import WhyImportant from '$lib/components/WhyImportant.svelte';
  import Process from '$lib/components/Process.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import Benefits from '$lib/components/Benefits.svelte';
  import BeforeAfter from '$lib/components/BeforeAfter.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import Stages from '$lib/components/Stages.svelte';
  import ContactForm from '$lib/components/ContactForm.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CookieConsent from '$lib/components/CookieConsent.svelte';
  import MobileContactDock from '$lib/components/MobileContactDock.svelte';
  import { meta_title, meta_description } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  const BASE_URL = 'https://dpflab.ee';
  $: canonicalUrl = data.locale === 'ru' ? `${BASE_URL}/` : `${BASE_URL}/${data.locale}`;
  $: ogLocale = data.locale === 'et' ? 'et_EE' : data.locale === 'en' ? 'en_GB' : 'ru_RU';
  $: ogLocaleAlts = ['ru_RU', 'et_EE', 'en_GB'].filter((value) => value !== ogLocale);
  $: structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: 'DPFLAB',
    url: canonicalUrl,
    image: `${BASE_URL}/hero-dpf-1000.webp`,
    telephone: data.contactsRow?.phone ?? '+372 5555 5014',
    email: data.contactsRow?.email ?? 'info@dpflab.ee',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Saha-Loo tee 36',
      addressLocality: 'Iru',
      postalCode: '74206',
      addressCountry: 'EE'
    }
  });
</script>

<svelte:head>
  <title>{meta_title()}</title>
  <meta name="description" content={meta_description()} />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={canonicalUrl} />

  <link rel="alternate" hreflang="ru" href="{BASE_URL}/" />
  <link rel="alternate" hreflang="et" href="{BASE_URL}/et" />
  <link rel="alternate" hreflang="en" href="{BASE_URL}/en" />
  <link rel="alternate" hreflang="x-default" href="{BASE_URL}/" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={meta_title()} />
  <meta property="og:description" content={meta_description()} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:site_name" content="DPFLAB" />
  <meta property="og:locale" content={ogLocale} />
  {#each ogLocaleAlts as localeAlt}
    <meta property="og:locale:alternate" content={localeAlt} />
  {/each}
  <meta property="og:image" content="{BASE_URL}/hero-dpf-1000.webp" />
  <meta property="og:image:width" content="1000" />
  <meta property="og:image:height" content="750" />
  <meta property="og:image:alt" content={meta_title()} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={meta_title()} />
  <meta name="twitter:description" content={meta_description()} />
  <meta name="twitter:image" content="{BASE_URL}/hero-dpf-1000.webp" />
  <script type="application/ld+json">{structuredData}</script>
</svelte:head>

<Header contactsRow={data.contactsRow} />
<main>
  <Hero image={data.siteImagesMap.hero_main} locale={data.locale} />
  <WhyImportant image={data.siteImagesMap.why_main} />
  <Process />
  <Pricing items={data.pricingItems} locale={data.locale} />
  <Benefits />
  <BeforeAfter items={data.beforeAfterItems} />
  <Stages />
  <FAQ items={data.faqItems} />
  <ContactForm contactsRow={data.contactsRow} locale={data.locale} {form} />
</main>
<Footer locale={data.locale} contactsRow={data.contactsRow} />
<MobileContactDock locale={data.locale} contactsRow={data.contactsRow} />
<CookieConsent metaPixelId={data.metaPixelId} />
