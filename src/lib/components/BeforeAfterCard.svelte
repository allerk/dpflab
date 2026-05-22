<script lang="ts">
  export let sliderEnabled: boolean;
  export let imageBefore: string | null;
  export let imageAfter: string | null;
  export let labelBefore: string;
  export let labelAfter: string;

  let pos = 50;
  let card: HTMLDivElement;
  let dragging = false;

  const update = (clientX: number) => {
    const r = card.getBoundingClientRect();
    pos = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };
  const onDown = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    dragging = true;
    update('touches' in e ? e.touches[0].clientX : e.clientX);
  };
  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    update('touches' in e ? e.touches[0].clientX : e.clientX);
  };
  const onUp = () => (dragging = false);
</script>

{#if sliderEnabled}
  <div
    bind:this={card}
    class="ba-card select-none"
    on:mousedown={onDown} on:mousemove={onMove} on:mouseup={onUp} on:mouseleave={onUp}
    on:touchstart={onDown} on:touchmove={onMove} on:touchend={onUp}
    role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(pos)} tabindex="0"
  >
    {#if imageAfter}
      <img src="/images/{imageAfter}" alt={labelAfter} class="ba-img ba-after" draggable="false" />
    {:else}
      <div class="ba-img ba-after placeholder">[{labelAfter}]</div>
    {/if}
    <div class="ba-img ba-before" style="clip-path: inset(0 {100 - pos}% 0 0)">
      {#if imageBefore}
        <img src="/images/{imageBefore}" alt={labelBefore} draggable="false" style="width:100%;height:100%;object-fit:cover" />
      {:else}
        <div class="placeholder" style="width:100%;height:100%">[{labelBefore}]</div>
      {/if}
    </div>
    <div class="ba-divider" style="left: {pos}%">
      <div class="ba-handle"><span>‹</span><span>›</span></div>
    </div>
    <span class="ba-label ba-label-before">{labelBefore}</span>
    <span class="ba-label ba-label-after">{labelAfter}</span>
  </div>
{:else}
  {#if imageBefore}
    <img src="/images/{imageBefore}" alt="" class="w-full h-full object-cover rounded-card" />
  {:else}
    <div class="placeholder w-full aspect-square">[До/После]</div>
  {/if}
{/if}
