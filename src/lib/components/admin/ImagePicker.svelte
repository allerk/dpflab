<script lang="ts">
  import { onMount } from 'svelte';

  export let id: string;
  export let name: string;
  export let label: string;
  export let value: string = '';
  export let images: string[] = [];

  let open = false;
  let container: HTMLDivElement;

  function select(img: string) {
    value = img;
    open = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }

  onMount(() => {
    function onClick(e: MouseEvent) {
      if (!container.contains(e.target as Node)) open = false;
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });
</script>

<svelte:window on:keydown={onKeydown} />

<div>
  <label for={id} class="block text-sm mb-1">{label}</label>
  <input type="hidden" {name} {id} {value} />

  <div bind:this={container} class="relative">
    <button
      type="button"
      on:click={() => (open = !open)}
      class="w-full flex items-center gap-2 rounded-input border border-border bg-bg px-3 py-2 text-sm text-left focus:outline-none focus:border-accent hover:border-accent/60 transition-colors"
    >
      {#if value}
        <img src="/images/{value}" alt="" class="h-6 w-6 object-cover rounded shrink-0" />
        <span class="font-mono truncate flex-1">{value}</span>
      {:else}
        <span class="text-fg-muted flex-1">— select image —</span>
      {/if}
      <span class="text-fg-muted text-xs shrink-0">{open ? '▲' : '▼'}</span>
    </button>

    {#if open}
      <div
        class="absolute z-50 mt-1 w-full rounded-card border border-border bg-bg-card shadow-lg max-h-64 overflow-y-auto"
      >
        {#if images.length === 0}
          <p class="px-3 py-2 text-sm text-fg-muted">No images uploaded yet.</p>
        {:else}
          <button
            type="button"
            on:click={() => select('')}
            class="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left hover:bg-bg transition-colors text-fg-muted {value === '' ? 'bg-accent/10' : ''}"
          >
            — none —
          </button>
          {#each images as img}
            <button
              type="button"
              on:click={() => select(img)}
              class="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left hover:bg-bg transition-colors {img === value ? 'bg-accent/10 text-accent' : ''}"
            >
              <img src="/images/{img}" alt="" class="h-8 w-8 object-cover rounded shrink-0" />
              <span class="font-mono truncate">{img}</span>
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>
