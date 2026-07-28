<script lang="ts">
  import Icon from '$lib/Icon.svelte';
  import type { ContactsRow } from '$lib/db/repositories/contacts';
  import { trackMetaEvent, trackMetaStandardEvent } from '$lib/analytics';
  import {
    mobile_contact_call,
    mobile_contact_request,
    mobile_contact_whatsapp
  } from '$lib/paraglide/messages';

  export let contactsRow: ContactsRow | null = null;
  export let locale: string = 'ru';

  const trackContact = (channel: string) =>
    trackMetaStandardEvent('Contact', {
      channel,
      placement: 'mobile_dock',
      locale
    });
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-[80] hidden max-md:block border-t border-white/10 bg-[#0b0b0b]/95 shadow-[0_-12px_36px_rgba(0,0,0,.42)] backdrop-blur-md"
  aria-label="Quick contact"
>
  <div
    class="grid min-h-[62px] grid-cols-3"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <a
      href={contactsRow?.phoneHref ?? 'tel:+37255555014'}
      class="flex min-w-0 flex-col items-center justify-center gap-1 border-r border-white/10 px-2 py-2 text-[11px] font-semibold"
      onclick={() => trackContact('phone')}
    >
      <Icon name="phone" size={19} />
      <span>{mobile_contact_call()}</span>
    </a>

    <a
      href={contactsRow?.whatsapp ?? 'https://wa.me/37255555014'}
      target="_blank"
      rel="noreferrer"
      class="flex min-w-0 flex-col items-center justify-center gap-1 border-r border-white/10 px-2 py-2 text-[11px] font-semibold"
      onclick={() => trackContact('whatsapp')}
    >
      <Icon name="whatsapp" size={19} />
      <span>{mobile_contact_whatsapp()}</span>
    </a>

    <a
      href="#contacts"
      class="flex min-w-0 flex-col items-center justify-center gap-1 bg-accent px-2 py-2 text-[11px] font-bold text-accent-fg"
      onclick={() => trackMetaEvent('LeadFormIntent', { placement: 'mobile_dock', locale })}
    >
      <Icon name="arrow-right" size={19} />
      <span>{mobile_contact_request()}</span>
    </a>
  </div>
</nav>
