<script lang="ts">
  import {
    admin_dashboard_title,
    admin_dashboard_welcome,
    admin_nav_faq,
    admin_nav_reviews,
    admin_nav_pricing,
    admin_nav_certificates,
    admin_nav_contacts,
    admin_nav_submissions,
    admin_nav_before_after,
    admin_nav_images
  } from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: sections = [
    { href: '/admin/faq', label: admin_nav_faq() },
    { href: '/admin/reviews', label: admin_nav_reviews() },
    { href: '/admin/pricing', label: admin_nav_pricing() },
    { href: '/admin/certificates', label: admin_nav_certificates() },
    { href: '/admin/contacts', label: admin_nav_contacts() },
    { href: '/admin/submissions', label: admin_nav_submissions() },
    { href: '/admin/before-after', label: admin_nav_before_after() },
    { href: '/admin/images', label: admin_nav_images() }
  ];
</script>

<div class="max-w-2xl">
  <h1 class="text-2xl font-bold mb-1">{admin_dashboard_title()}</h1>
  <p class="text-fg-muted mb-8 text-sm">{admin_dashboard_welcome()}, {data.adminEmail}</p>

  <div class="grid grid-cols-1 gap-4">
    {#each sections as item}
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
