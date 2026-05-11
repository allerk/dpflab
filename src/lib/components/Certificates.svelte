<script lang="ts">
  import {
    cert_title, cert_title_accent,
    cert_1_title, cert_1_text, cert_2_title, cert_2_text,
    cert_3_title, cert_3_text, cert_4_title, cert_4_text
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  const icons = ['award', 'shield', 'check', 'report'];
  $: items = [
    { title: cert_1_title(), text: cert_1_text() },
    { title: cert_2_title(), text: cert_2_text() },
    { title: cert_3_title(), text: cert_3_text() },
    { title: cert_4_title(), text: cert_4_text() }
  ];
</script>

<section id="certificates" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">
      {cert_title()} <span class="text-accent">{cert_title_accent()}</span>
    </h2>
    <div class="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-xs:grid-cols-1">
      {#each items as c, i}
        <div class="bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] hover:shadow-[0_8px_28px_rgba(0,0,0,.4)] hover:-translate-y-[3px] transition-[transform,box-shadow] duration-200 px-5 py-6 flex flex-col items-center text-center gap-2.5">
          <div class="w-[52px] h-[52px] rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <Icon name={icons[i % icons.length]} size={28}/>
          </div>
          <h3 class="text-[15px] font-bold m-0">{c.title}</h3>
          <p class="text-[12px] text-fg-muted m-0">{c.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
