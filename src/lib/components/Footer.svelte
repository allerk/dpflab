<script lang="ts">
  import {
    brand_tagline,
    footer_copy, footer_rights,
    contacts_email, contacts_phone_href
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';
</script>

<footer class="bg-[#0a0a0a] border-t border-border py-7">
  <div class="container grid grid-cols-[auto_1fr_auto] gap-8 items-start max-md:grid-cols-1 max-md:gap-[18px] max-md:text-center max-md:justify-items-center">

    <div class="flex flex-col leading-[1.05] self-center">
      <span class="font-black text-[22px] tracking-[0.02em] after:content-['.'] after:text-accent">DPFLAB</span>
      <span class="text-[9px] tracking-[0.18em] text-fg-muted uppercase mt-0.5">{brand_tagline()}</span>
    </div>

    <div class="flex flex-col gap-1 text-[13px] text-fg-muted self-start">
      <div>{footer_copy()}</div>
      <div class="opacity-70 text-[12px]">{footer_rights()}</div>
    </div>

    <div class="flex gap-2.5 self-center">
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
