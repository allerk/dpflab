<script lang="ts">
  import {
    brand_tagline,
    footer_copy, footer_rights, footer_link_1, footer_link_2,
    contacts_whatsapp, contacts_email, contacts_phone_href, contacts_phone
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  $: footerLinks = [
    { label: footer_link_1(), href: '#' },
    { label: footer_link_2(), href: '#' }
  ];
</script>

<footer class="bg-[#0a0a0a] border-t border-border py-7">
  <div class="container grid grid-cols-[auto_1fr_auto_auto] gap-8 items-start max-md:grid-cols-1 max-md:gap-[18px] max-md:text-center max-md:justify-items-center">

    <div class="flex flex-col leading-[1.05] self-center">
      <span class="font-black text-[22px] tracking-[0.02em] after:content-['.'] after:text-accent">DPFLAB</span>
      <span class="text-[9px] tracking-[0.18em] text-fg-muted uppercase mt-0.5">{brand_tagline()}</span>
    </div>

    <div class="flex flex-col gap-1 text-[13px] text-fg-muted self-start">
      <div>{footer_copy()}</div>
      <div class="opacity-70 text-[12px]">{footer_rights()}</div>
    </div>

    <div class="flex flex-col gap-1.5 text-[13px] text-fg-muted self-start">
      {#each footerLinks as l}
        <a href={l.href} class="hover:text-fg transition-colors">{l.label}</a>
      {/each}
    </div>

    <div class="flex gap-2.5 self-center">
      <a href={contacts_whatsapp()} target="_blank" rel="noreferrer" aria-label="WhatsApp"
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="whatsapp" size={18}/>
      </a>
      <a href="mailto:{contacts_email()}" aria-label="Email"
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="mail" size={18}/>
      </a>
      <a href={contacts_phone_href()} aria-label="Phone"
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="phone" size={18}/>
      </a>
    </div>
  </div>
</footer>
