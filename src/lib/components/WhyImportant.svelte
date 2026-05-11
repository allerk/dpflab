<script lang="ts">
  import {
    why_title, why_lead, why_point_1, why_point_2, why_point_3, why_point_4,
    why_footer, why_image_alt
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  $: points = [why_point_1(), why_point_2(), why_point_3(), why_point_4()];
</script>

<section id="why" class="bg-bg py-[60px]">
  <div class="container grid grid-cols-2 gap-[60px] items-center max-md:grid-cols-1 max-md:gap-8">
    <div class="min-w-0">
      <h2 class="text-[clamp(26px,3vw,38px)] font-extrabold tracking-[0.02em] mb-4">{why_title()}</h2>
      <p class="text-fg-muted text-[15px] mb-4">{why_lead()}</p>
      <ul class="list-none p-0 m-0 mb-5 flex flex-col gap-2.5">
        {#each points as p}
          <li class="flex items-center gap-3 text-[16px]">
            <span class="text-danger shrink-0"><Icon name="cross" size={20}/></span>
            <span>{p}</span>
          </li>
        {/each}
      </ul>
      <p class="text-[14px] text-fg-muted border-l-[3px] border-accent pl-3.5 m-0">{why_footer()}</p>
    </div>

    <div class="min-w-0 aspect-[4/3]">
      <div class="placeholder w-full h-full">
        [ {why_image_alt()} ]<br/>
        <span style="opacity:.6">фото DPF: до / после</span>
      </div>
    </div>
  </div>
</section>
