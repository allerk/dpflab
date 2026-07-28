<script lang="ts">
  import { onMount } from 'svelte';
  import {
    cookie_accept,
    cookie_reject,
    cookie_text,
    cookie_title
  } from '$lib/paraglide/messages';
  import {
    getConsentChoice,
    initMetaPixel,
    openConsentEventName,
    setConsentChoice,
    type ConsentChoice
  } from '$lib/analytics';

  export let metaPixelId: string | undefined = undefined;

  let visible = false;

  onMount(() => {
    visible = getConsentChoice() === null;
    initMetaPixel(metaPixelId);

    const open = () => (visible = true);
    window.addEventListener(openConsentEventName(), open);
    return () => window.removeEventListener(openConsentEventName(), open);
  });

  function choose(choice: ConsentChoice) {
    setConsentChoice(choice);
    visible = false;
    if (choice === 'accepted') initMetaPixel(metaPixelId);
  }
</script>

{#if visible}
  <aside
    class="fixed z-[100] left-5 bottom-5 w-[min(430px,calc(100vw-40px))] bg-bg-elev border border-border rounded-card shadow-[0_18px_60px_rgba(0,0,0,.55)] p-5 max-md:bottom-[76px] max-xs:left-3 max-xs:w-[calc(100vw-24px)]"
    aria-labelledby="cookie-consent-title"
  >
    <div class="h-1 w-16 bg-accent rounded-full mb-4"></div>
    <h2 id="cookie-consent-title" class="text-[18px] font-extrabold mb-1.5">{cookie_title()}</h2>
    <p class="text-[13px] leading-relaxed text-fg-muted mb-4">{cookie_text()}</p>
    <div class="flex flex-wrap gap-2.5">
      <button
        type="button"
        class="bg-accent text-accent-fg font-semibold text-[13px] px-4 py-2.5 rounded-btn hover:bg-accent-h transition-colors"
        on:click={() => choose('accepted')}
      >
        {cookie_accept()}
      </button>
      <button
        type="button"
        class="border border-border text-fg text-[13px] px-4 py-2.5 rounded-btn hover:border-fg-muted transition-colors"
        on:click={() => choose('necessary')}
      >
        {cookie_reject()}
      </button>
    </div>
  </aside>
{/if}
