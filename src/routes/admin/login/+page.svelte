<script lang="ts">
  import {
    admin_login_title,
    admin_login_email_label,
    admin_login_password_label,
    admin_login_submit,
    admin_login_error
  } from '$lib/paraglide/messages';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let showPassword = false;
</script>

<svelte:head>
  <title>{admin_login_title()} — DPFLAB</title>
</svelte:head>

<div class="min-h-screen bg-bg flex items-center justify-center px-4">
  <div class="w-full max-w-sm">
    <h1 class="text-xl font-bold mb-6 text-center">
      DPFLAB <span class="text-accent">Admin</span>
    </h1>

    <form
      method="POST"
      class="bg-bg-card rounded-card p-6 border border-border space-y-4"
    >
      {#if form?.error}
        <p class="text-danger text-sm" role="alert">{admin_login_error()}</p>
      {/if}

      <div>
        <label for="email" class="block text-sm font-medium mb-1.5">
          {admin_login_email_label()}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autocomplete="username"
          class="w-full bg-bg border border-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-1.5">
          {admin_login_password_label()}
        </label>
        <div class="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autocomplete="current-password"
            class="w-full bg-bg border border-border rounded-input px-3 py-2 pr-10 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            on:click={() => (showPassword = !showPassword)}
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            {#if showPassword}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="w-full bg-accent text-accent-fg font-semibold py-2 rounded-btn hover:bg-accent-h transition-colors cursor-pointer"
      >
        {admin_login_submit()}
      </button>
    </form>
  </div>
</div>
