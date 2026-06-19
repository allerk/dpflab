<script lang="ts">
  import {
    stages_title, stages_title_accent, stages_filters,
    stage_1_label, stage_1_name, stage_1_desc,
    stage_2_label, stage_2_name, stage_2_desc,
    stage_3_label, stage_3_name, stage_3_desc
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';

  $: stages = [
    { icon: 'wind', label: stage_1_label(), name: stage_1_name(), desc: stage_1_desc() },
    { icon: 'drop', label: stage_2_label(), name: stage_2_name(), desc: stage_2_desc() },
    { icon: 'flame', label: stage_3_label(), name: stage_3_name(), desc: stage_3_desc() }
  ];
</script>

<section id="stages" class="section bg-[#0a0a0a]">
  <div class="container">
    <h2 class="text-[clamp(28px,3.5vw,42px)] font-extrabold text-center tracking-[0.02em] mb-2 max-sm:text-[clamp(22px,6vw,28px)]">
      {stages_title()} <span class="text-accent">{stages_title_accent()}</span>
    </h2>
    <p class="text-center text-[14px] tracking-[0.18em] text-fg-muted font-mono uppercase mb-10">{stages_filters()}</p>

    <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-8">
      {#each stages as s, i}
        <div class="relative flex flex-col items-center text-center bg-bg-card rounded-card px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,.3)]">
          <span class="text-[12px] font-bold tracking-[0.12em] uppercase text-accent mb-3">{s.label}</span>
          <div class="w-16 h-16 rounded-full border-2 border-accent text-accent flex items-center justify-center mb-4">
            <Icon name={s.icon} size={32}/>
          </div>
          <h3 class="text-[15px] font-extrabold tracking-[0.04em] mb-1.5">{s.name}</h3>
          <p class="text-[13px] text-fg-muted m-0 leading-snug">{s.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
