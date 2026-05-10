<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;
</script>

<section id="why" class="section bg-bg py-[60px]">
  <div class="container grid grid-cols-2 gap-[60px] items-center max-sm:grid-cols-1 max-sm:gap-8">
    <div class="min-w-0">
      <h2 class="text-[clamp(26px,3vw,38px)] font-black tracking-wide mb-4">{t.why.title}</h2>
      <p class="text-fg-muted text-[15px] mb-4">{t.why.lead}</p>
      <ul class="list-none p-0 m-0 mb-5 flex flex-col gap-2.5">
        {#each t.why.points as p}
          <li class="flex items-center gap-3 text-[16px]">
            <span class="text-danger shrink-0"><Icon name="cross" size={20}/></span>
            <span>{p}</span>
          </li>
        {/each}
      </ul>
      <p class="text-[14px] text-fg-muted border-l-[3px] border-accent pl-3.5 m-0">{t.why.footer}</p>
    </div>

    <div class="min-w-0 aspect-[4/3]">
      <div class="placeholder w-full h-full">
        [ {t.why.imageAlt} ]<br/>
        <span style="opacity:.6">фото DPF: до / после</span>
      </div>
    </div>
  </div>
</section>
