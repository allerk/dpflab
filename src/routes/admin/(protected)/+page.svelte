<script lang="ts">
  import { admin_dashboard_title, admin_dashboard_welcome } from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div class="max-w-2xl">
  <h1 class="text-2xl font-bold mb-1">{admin_dashboard_title()}</h1>
  <p class="text-fg-muted mb-8 text-sm">{admin_dashboard_welcome()}, {data.adminEmail}</p>

  <div class="grid grid-cols-1 gap-4">
    <div class="bg-bg-card rounded-card p-5 border border-border">
      <h2 class="font-semibold mb-1">FAQ</h2>
      <p class="text-fg-muted text-sm">Coming soon</p>
    </div>
    <div class="bg-bg-card rounded-card p-5 border border-border">
      <h2 class="font-semibold mb-1">Reviews</h2>
      <p class="text-fg-muted text-sm">Coming soon</p>
    </div>
    <div class="bg-bg-card rounded-card p-5 border border-border">
      <h2 class="font-semibold mb-1">Pricing</h2>
      <p class="text-fg-muted text-sm">Coming soon</p>
    </div>
    <div class="bg-bg-card rounded-card p-5 border border-border">
      <h2 class="font-semibold mb-1">Contacts</h2>
      <p class="text-fg-muted text-sm">Coming soon</p>
    </div>
  </div>
</div>
