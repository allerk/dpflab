<script lang="ts">
  export let before: string;
  export let after: string;
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
    dragging = true;
    update('touches' in e ? e.touches[0].clientX : e.clientX);
  };
  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    update('touches' in e ? e.touches[0].clientX : e.clientX);
  };
  const onUp = () => (dragging = false);
</script>

<div
  bind:this={card}
  class="ba-card"
  on:mousedown={onDown} on:mousemove={onMove} on:mouseup={onUp} on:mouseleave={onUp}
  on:touchstart={onDown} on:touchmove={onMove} on:touchend={onUp}
  role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(pos)} tabindex="0"
>
  <div class="ba-img ba-after placeholder">[ {after} ]</div>
  <div class="ba-img ba-before placeholder" style="clip-path: inset(0 {100 - pos}% 0 0)">[ {before} ]</div>
  <div class="ba-divider" style="left: {pos}%">
    <div class="ba-handle"><span>‹</span><span>›</span></div>
  </div>
  <span class="ba-label ba-label-before">{labelBefore}</span>
  <span class="ba-label ba-label-after">{labelAfter}</span>
</div>
