<script lang="ts">
  import {
    brand_tagline,
    footer_copy, footer_rights,
    contacts_email, contacts_phone_href,
    footer_privacy, cookie_settings
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';
  import { openConsentSettings } from '$lib/analytics';
  import { trackMetaStandardEvent } from '$lib/analytics';
  import type { ContactsRow } from '$lib/db/repositories/contacts';

  export let locale: string = 'ru';
  export let contactsRow: ContactsRow | null = null;

  $: privacyHref = locale === 'ru' ? '/privacy' : `/${locale}/privacy`;
</script>

<footer class="bg-[#0a0a0a] border-t border-border py-7">
  <div class="container grid grid-cols-[auto_1fr_auto] gap-8 items-start max-md:grid-cols-1 max-md:gap-[18px] max-md:text-center max-md:justify-items-center">

    <div class="flex flex-col leading-[1.05] self-center">
      <span class="font-black text-[22px] tracking-[0.02em] after:content-['.'] after:text-accent">DPFLAB</span>
      <span class="text-[9px] tracking-[0.18em] text-fg-muted uppercase mt-0.5">{brand_tagline()}</span>
    </div>

    <div class="flex flex-col gap-1.5 text-[13px] text-fg-muted self-start">
      <div>{footer_copy()}</div>
      <div class="opacity-70 text-[12px]">{footer_rights()}</div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-[12px] max-md:justify-center">
        <a href={privacyHref} class="hover:text-fg transition-colors underline underline-offset-4 decoration-border">{footer_privacy()}</a>
        <button
          type="button"
          class="text-left hover:text-fg transition-colors underline underline-offset-4 decoration-border cursor-pointer"
          on:click={openConsentSettings}
        >
          {cookie_settings()}
        </button>
      </div>
    </div>

    <div class="flex gap-2.5 self-center">
      {#if contactsRow?.whatsapp}
        <a href={contactsRow.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"
           on:click={() => trackMetaStandardEvent('Contact', { channel: 'whatsapp', placement: 'footer', locale })}
           class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
          <Icon name="whatsapp" size={18}/>
        </a>
      {/if}
      <a href="mailto:{contactsRow?.email ?? contacts_email()}" aria-label="Email"
         on:click={() => trackMetaStandardEvent('Contact', { channel: 'email', placement: 'footer', locale })}
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="mail" size={18}/>
      </a>
      <a href={contactsRow?.phoneHref ?? contacts_phone_href()} aria-label="Phone"
         on:click={() => trackMetaStandardEvent('Contact', { channel: 'phone', placement: 'footer', locale })}
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="phone" size={18}/>
      </a>
    </div>
  </div>
</footer>
