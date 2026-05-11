<script lang="ts">
  import {
    benefits_title, benefits_title_accent,
    benefits_item_1, benefits_item_2, benefits_item_3, benefits_item_4, benefits_item_5
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  const itemIcons = ['machine', 'drop', 'car', 'handshake', 'shield'];
  $: items = [
    { icon: itemIcons[0], text: benefits_item_1() },
    { icon: itemIcons[1], text: benefits_item_2() },
    { icon: itemIcons[2], text: benefits_item_3() },
    { icon: itemIcons[3], text: benefits_item_4() },
    { icon: itemIcons[4], text: benefits_item_5() }
  ];
</script>

<section id="benefits" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-10 max-sm:text-[clamp(22px,6vw,28px)]">
      {benefits_title()} <span class="text-accent">{benefits_title_accent()}</span>
    </h2>

    <div class="grid grid-cols-5 gap-6 max-md:grid-cols-2 max-md:gap-y-7 max-md:gap-x-4 max-xs:grid-cols-1">
      {#each items as b}
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 flex items-center justify-center mb-3.5 text-fg">
            <Icon name={b.icon} size={36}/>
          </div>
          <p class="text-[13px] m-0 max-w-[160px] leading-snug text-fg-muted">{b.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
