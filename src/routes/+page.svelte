<script lang="ts">
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
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;
</script>

<svelte:head>
  <title>DPFLAB — Очистка DPF фильтров в Эстонии</title>
</svelte:head>

<Header />
<main>
  <Hero />
  <WhyImportant />
  <Process />
  <Pricing items={data.pricingItems} />
  <Benefits />
  <BeforeAfter />
  <Reviews items={data.reviewItems} />
  <FAQ items={data.faqItems} />
  <Certificates items={data.certificateItems} />
  <ContactForm contactsRow={data.contactsRow} {form} />
</main>
<Footer />
