<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <span class="brand-name">{t.brand.name}</span>
      <span class="brand-tag">{t.brand.tagline}</span>
    </div>
    <div class="footer-copy">
      <div>{t.footer.copy}</div>
      <div class="muted">{t.footer.rights}</div>
    </div>
    <div class="footer-links">
      {#each t.footer.links as l}
        <a href={l.href}>{l.label}</a>
      {/each}
    </div>
    <div class="footer-social">
      <a href={t.contacts.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={18}/></a>
      <a href="mailto:{t.contacts.email}" aria-label="Email"><Icon name="mail" size={18}/></a>
      <a href={t.contacts.phoneHref} aria-label="Phone"><Icon name="phone" size={18}/></a>
    </div>
  </div>
</footer>
