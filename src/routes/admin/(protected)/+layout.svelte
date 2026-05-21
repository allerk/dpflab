<script lang="ts">
  import {
    admin_dashboard_title,
    admin_logout,
    admin_nav_faq,
    admin_nav_reviews,
    admin_nav_pricing,
    admin_nav_certificates,
    admin_nav_contacts,
    admin_nav_submissions
  } from '$lib/paraglide/messages';
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  const navLinks = [
    { href: '/admin/faq', label: admin_nav_faq },
    { href: '/admin/reviews', label: admin_nav_reviews },
    { href: '/admin/pricing', label: admin_nav_pricing },
    { href: '/admin/certificates', label: admin_nav_certificates },
    { href: '/admin/contacts', label: admin_nav_contacts },
    { href: '/admin/submissions', label: admin_nav_submissions }
  ];

  $: currentPath = $page.url.pathname;
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

  <nav class="bg-bg-elev border-b border-border px-6 flex gap-1 overflow-x-auto">
    {#each navLinks as link}
      <a
        href={link.href}
        class="px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors {currentPath.startsWith(
          link.href
        )
          ? 'border-accent text-accent font-medium'
          : 'border-transparent text-fg-muted hover:text-fg'}"
      >
        {link.label()}
      </a>
    {/each}
  </nav>

  <main class="container py-8">
    <slot />
  </main>
</div>
