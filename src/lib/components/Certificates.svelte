<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
  const icons = ['award', 'shield', 'check', 'report'];
</script>

<section id="certificates" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-black text-center tracking-wide mb-10">
      {t.certificates.title} <span class="text-accent">{t.certificates.titleAccent}</span>
    </h2>
    <div class="grid grid-cols-4 gap-5 max-sm:grid-cols-2">
      {#each t.certificates.items as c, i}
        <div class="bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] hover:shadow-[0_8px_28px_rgba(0,0,0,.4)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 p-6 flex flex-col items-center text-center gap-2.5">
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
