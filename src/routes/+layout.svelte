<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';

  const SCROLL_KEY = 'lang-switch-scroll';

  onMount(() => {
    const stored = sessionStorage.getItem(SCROLL_KEY);
    if (stored) {
      sessionStorage.removeItem(SCROLL_KEY);
      const y = Number(stored);
      if (isFinite(y) && y > 0) {
        // Double rAF ensures the browser has completed layout before we scroll,
        // so the target Y position is actually reachable.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: 'instant' });
          });
        });
      }
    }
  });
</script>

<slot />
