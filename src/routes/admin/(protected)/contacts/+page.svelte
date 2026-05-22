<script lang="ts">
  import {
    admin_contacts_title,
    admin_contacts_phone,
    admin_contacts_phone_href,
    admin_contacts_whatsapp,
    admin_contacts_email,
    admin_contacts_address,
    admin_contacts_weekdays_open,
    admin_contacts_weekdays_close,
    admin_contacts_saturday_open,
    admin_contacts_saturday_close,
    admin_action_save,
    admin_error_required
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: c = data.contacts;
  $: v = form?.values;
</script>

<div class="max-w-2xl">
  <h1 class="text-2xl font-bold mb-6">{admin_contacts_title()}</h1>

  {#if !c}
    <p class="text-danger text-sm">No contacts row found. Please run the seed script.</p>
  {:else}
    <form method="POST" action="?/update" class="bg-bg-card border border-border rounded-card p-5 space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="phone" class="block text-sm font-medium mb-1">{admin_contacts_phone()}</label>
          <input id="phone" name="phone" type="text" value={v?.phone ?? c.phone}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.phone}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="phone_href" class="block text-sm font-medium mb-1">{admin_contacts_phone_href()}</label>
          <input id="phone_href" name="phone_href" type="text" value={v?.phoneHref ?? c.phoneHref}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.phone_href}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="whatsapp" class="block text-sm font-medium mb-1">{admin_contacts_whatsapp()}</label>
          <input id="whatsapp" name="whatsapp" type="text" value={v?.whatsapp ?? c.whatsapp}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.whatsapp}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="email" class="block text-sm font-medium mb-1">{admin_contacts_email()}</label>
          <input id="email" name="email" type="email" value={v?.email ?? c.email}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.email}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div class="md:col-span-2">
          <label for="address" class="block text-sm font-medium mb-1">{admin_contacts_address()}</label>
          <input id="address" name="address" type="text" value={v?.address ?? c.address}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.address}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="weekdays_open" class="block text-sm font-medium mb-1">{admin_contacts_weekdays_open()}</label>
          <input id="weekdays_open" name="weekdays_open" type="text" value={v?.weekdaysOpen ?? c.weekdaysOpen}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.weekdays_open}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="weekdays_close" class="block text-sm font-medium mb-1">{admin_contacts_weekdays_close()}</label>
          <input id="weekdays_close" name="weekdays_close" type="text" value={v?.weekdaysClose ?? c.weekdaysClose}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
          {#if form?.errors?.weekdays_close}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="saturday_open" class="block text-sm font-medium mb-1">{admin_contacts_saturday_open()}</label>
          <input id="saturday_open" name="saturday_open" type="text" value={v?.saturdayOpen ?? c.saturdayOpen ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label for="saturday_close" class="block text-sm font-medium mb-1">{admin_contacts_saturday_close()}</label>
          <input id="saturday_close" name="saturday_close" type="text" value={v?.saturdayClose ?? c.saturdayClose ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        </div>
      </div>

      <button type="submit"
        class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
        {admin_action_save()}
      </button>
    </form>
  {/if}
</div>
