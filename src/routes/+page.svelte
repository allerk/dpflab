<script lang="ts">
  import { CONTENT } from '$lib/content';
  import { lang } from '$lib/stores';
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import WhyImportant from '$lib/components/WhyImportant.svelte';
  import Process from '$lib/components/Process.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import Benefits from '$lib/components/Benefits.svelte';
  import BeforeAfter from '$lib/components/BeforeAfter.svelte';
  import Reviews from '$lib/components/Reviews.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import Certificates from '$lib/components/Certificates.svelte';
  import ContactForm from '$lib/components/ContactForm.svelte';
  import Footer from '$lib/components/Footer.svelte';

  $: t = CONTENT[$lang];
</script>

<svelte:head>
  <title>DPFLAB — Очистка DPF фильтров в Эстонии</title>
<!--  <html lang={$lang} />-->
</svelte:head>

<Header {t} />
<main>
  <Hero {t} />
  <WhyImportant {t} />
  <Process {t} />
  <Pricing {t} />
  <Benefits {t} />
  <BeforeAfter {t} />
  <Reviews {t} />
  <FAQ {t} />
  <Certificates {t} />
  <ContactForm {t} />
</main>
<Footer {t} />
