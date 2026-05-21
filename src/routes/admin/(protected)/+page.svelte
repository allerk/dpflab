<script lang="ts">
  import { admin_dashboard_title, admin_dashboard_welcome } from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div class="max-w-2xl">
  <h1 class="text-2xl font-bold mb-1">{admin_dashboard_title()}</h1>
  <p class="text-fg-muted mb-8 text-sm">{admin_dashboard_welcome()}, {data.adminEmail}</p>

  <div class="grid grid-cols-1 gap-4">
    {#each [
      { href: '/admin/faq', label: 'FAQ' },
      { href: '/admin/reviews', label: 'Reviews' },
      { href: '/admin/pricing', label: 'Pricing' },
      { href: '/admin/certificates', label: 'Certificates' },
      { href: '/admin/contacts', label: 'Contacts' },
      { href: '/admin/submissions', label: 'Submissions' }
    ] as item}
      <a
        href={item.href}
        class="bg-bg-card rounded-card p-5 border border-border hover:border-accent transition-colors block"
      >
        <h2 class="font-semibold mb-0.5">{item.label}</h2>
        <p class="text-fg-muted text-sm">→ Manage</p>
      </a>
    {/each}
  </div>
</div>
