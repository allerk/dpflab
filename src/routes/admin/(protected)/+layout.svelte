<script lang="ts">
  import { admin_dashboard_title, admin_logout } from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<svelte:head>
  <title>{admin_dashboard_title()} — DPFLAB</title>
</svelte:head>

<div class="min-h-screen bg-bg text-fg">
  <header class="bg-bg-elev border-b border-border px-6 h-14 flex items-center justify-between">
    <a href="/admin" class="font-bold text-base tracking-tight">
      DPFLAB <span class="text-accent">Admin</span>
    </a>
    <div class="flex items-center gap-4">
      <span class="text-fg-muted text-sm hidden xs:block">{data.adminEmail}</span>
      <form method="POST" action="/admin/logout">
        <button
          type="submit"
          class="text-sm px-3 py-1.5 rounded-btn border border-border hover:bg-bg-card transition-colors cursor-pointer"
        >
          {admin_logout()}
        </button>
      </form>
    </div>
  </header>

  <main class="container py-8">
    <slot />
  </main>
</div>
