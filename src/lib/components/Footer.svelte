<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<footer class="bg-[#0a0a0a] border-t border-border py-7">
  <div class="container grid grid-cols-[auto_1fr_auto_auto] gap-8 items-start max-sm:grid-cols-1 max-sm:gap-[18px] max-sm:text-center max-sm:justify-items-center">

    <div class="flex flex-col leading-[1.05] self-center">
      <span class="font-black text-[22px] tracking-wide after:content-['.'] after:text-accent">{t.brand.name}</span>
      <span class="text-[9px] tracking-[0.18em] text-fg-muted uppercase mt-0.5">{t.brand.tagline}</span>
    </div>

    <div class="flex flex-col gap-1 text-[13px] text-fg-muted self-start">
      <div>{t.footer.copy}</div>
      <div class="opacity-70 text-[12px]">{t.footer.rights}</div>
    </div>

    <div class="flex flex-col gap-1.5 text-[13px] text-fg-muted self-start">
      {#each t.footer.links as l}
        <a href={l.href} class="hover:text-fg transition-colors">{l.label}</a>
      {/each}
    </div>

    <div class="flex gap-2.5 self-center">
      <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="whatsapp" size={18}/>
      </a>
      <a href="mailto:{t.contacts.email}" aria-label="Email"
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="mail" size={18}/>
      </a>
      <a href={t.contacts.phoneHref} aria-label="Phone"
         class="w-9 h-9 rounded-full flex items-center justify-center bg-white/[.05] hover:bg-accent hover:text-accent-fg transition-[background,color]">
        <Icon name="phone" size={18}/>
      </a>
    </div>
  </div>
</footer>
