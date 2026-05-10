<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="process" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-black text-center tracking-wide mb-10 text-white">
      {t.process.title} <span class="text-accent">{t.process.titleAccent}</span>
    </h2>

    <div class="grid grid-cols-5 gap-5 relative pt-2 max-sm:grid-cols-2 max-sm:gap-7 max-[480px]:grid-cols-1">
      <!-- connector line (desktop only) -->
      <div class="absolute top-9 left-[10%] right-[10%] h-0.5 max-sm:hidden"
           aria-hidden="true"
           style="background-image: repeating-linear-gradient(to right, #7ED321 0, #7ED321 6px, transparent 6px, transparent 12px);">
      </div>

      {#each t.process.steps as s, i}
        <div class="flex flex-col items-center text-center relative z-10">
          <div class="relative w-16 h-16 rounded-full bg-[#0a0a0a] border-2 border-accent text-accent flex items-center justify-center mb-3">
            <Icon name={s.icon} size={28}/>
            <span class="absolute -top-1 -right-1 w-[22px] h-[22px] bg-accent text-accent-fg rounded-full text-[11px] font-black flex items-center justify-center">
              {i + 1}
            </span>
          </div>
          <p class="text-[13px] text-[#ddd] m-0 leading-snug max-w-[160px]">{s.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
