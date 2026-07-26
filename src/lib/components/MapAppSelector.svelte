<script lang="ts">
  import { tick } from 'svelte';
  import Icon from '$lib/Icon.svelte';
  import {
    map_selector_apple,
    map_selector_copy,
    map_selector_copy_error,
    map_selector_copy_success,
    map_selector_google,
    map_selector_open,
    map_selector_waze
  } from '$lib/paraglide/messages';
  import {
    buildMapActions,
    copyMapAddress,
    createMapMenuState,
    reduceMapMenuState,
    type MapMenuAction,
    type MapProvider
  } from '$lib/map-app-selector';

  interface Props {
    address: string;
  }

  let { address }: Props = $props();

  const labels: Record<MapProvider, () => string> = {
    google: map_selector_google,
    waze: map_selector_waze,
    apple: map_selector_apple
  };

  let menuState = $state(createMapMenuState());
  let root = $state<HTMLDivElement>();
  let trigger = $state<HTMLButtonElement>();
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

  let actions = $derived(buildMapActions(address));

  function dispatch(action: MapMenuAction) {
    menuState = reduceMapMenuState(menuState, action);
  }

  function close(returnFocus = false) {
    dispatch({ type: 'dismiss' });
    if (returnFocus) void tick().then(() => trigger?.focus());
  }

  async function copyAddress() {
    const result = await copyMapAddress(address, (value) =>
      navigator.clipboard.writeText(value)
    );
    dispatch({ type: 'copied', result });
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(
      () => dispatch({ type: 'clear-feedback' }),
      2500
    );
  }

  $effect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuState.open && root && !root.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (menuState.open && event.key === 'Escape') close(true);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(feedbackTimer);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div class="relative min-w-0 flex-1" bind:this={root}>
  <div class="flex items-center gap-3">
    <span class="flex shrink-0">
      <Icon name="map" size={17} />
    </span>
    <button
      bind:this={trigger}
      type="button"
      class="min-w-0 cursor-pointer flex-1 bg-transparent p-0 text-left text-[12px] underline decoration-fg-muted underline-offset-4 transition-colors hover:text-accent hover:decoration-current"
      aria-label={map_selector_open({ address })}
      aria-haspopup="menu"
      aria-expanded={menuState.open}
      aria-controls="map-app-menu"
      onclick={() => dispatch({ type: 'toggle' })}
    >
      {address}
    </button>
  </div>

  {#if menuState.open}
    <div
      id="map-app-menu"
      role="menu"
      class="absolute left-7 top-[calc(50%+8px)] z-20 w-[220px] overflow-hidden rounded-card border border-border bg-bg-elev p-1.5 shadow-[0_8px_24px_rgba(0,0,0,.4)]"
    >
      {#each actions as action}
        <a
          href={action.href}
          target="_blank"
          rel="noreferrer"
          role="menuitem"
          class="flex min-h-11 items-center rounded-md px-3 text-[13px] text-fg transition-colors hover:bg-white/[.06] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          onclick={() => close()}
        >
          {labels[action.provider]()}
        </a>
      {/each}
      <button
        type="button"
        role="menuitem"
        class="flex min-h-11 w-full items-center rounded-md bg-transparent px-3 text-left text-[13px] text-fg transition-colors hover:bg-white/[.06] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        onclick={copyAddress}
      >
        {map_selector_copy()}
      </button>
    </div>
  {/if}

  <div
    class="mt-1 min-h-[16px] text-[11px] leading-4"
    class:text-accent={menuState.feedback === 'success'}
    class:text-danger={menuState.feedback === 'error'}
    aria-live="polite"
  >
    {#if menuState.feedback === 'success'}
      {map_selector_copy_success()}
    {:else if menuState.feedback === 'error'}
      {map_selector_copy_error()}
    {/if}
  </div>
</div>
