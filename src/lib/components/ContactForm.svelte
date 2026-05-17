<script lang="ts">
  import {
    contact_title, contact_subtitle, contact_contacts_title,
    contact_field_name, contact_field_phone, contact_field_comment, contact_field_submit,
    contact_success, contact_valid_name, contact_valid_phone
  } from '$lib/paraglide/messages';
  import Icon from '$lib/Icon.svelte';
  import { enhance } from '$app/forms';
  import type { ContactsRow } from '$lib/db/repositories/contacts';

  export let contactsRow: ContactsRow | null = null;
  export let locale: string = 'ee';
  export let form: { errors?: Record<string, string>; name?: string; phone?: string; comment?: string; success?: boolean } | null = null;

  let clientErrors: Record<string, string> = {};
  let submitted = false;

  $: if (form?.success) submitted = true;
  $: nameError = clientErrors.name ?? (form?.errors?.name ? contact_valid_name() : '');
  $: phoneError = clientErrors.phone ?? (form?.errors?.phone ? contact_valid_phone() : '');

  // Paraglide tags ('ee') don't always match BCP-47 ('et' for Estonian).
  // Map for Intl APIs; pass-through for everything else.
  const toBcp47 = (l: string) => (l === 'ee' ? 'et' : l);

  // 2024-01-01 is Monday; mondayOffset 1=Mon ... 6=Sat lands on 2024-01-{offset}
  const weekdayLabel = (l: string, mondayOffset: number) => {
    const date = new Date(Date.UTC(2024, 0, mondayOffset));
    const label = new Intl.DateTimeFormat(toBcp47(l), { weekday: 'short', timeZone: 'UTC' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  $: weekdaysLine = contactsRow
    ? `${weekdayLabel(locale, 1)} – ${weekdayLabel(locale, 5)}: ${contactsRow.weekdaysOpen} – ${contactsRow.weekdaysClose}`
    : '';

  $: saturdayLine = contactsRow?.saturdayOpen && contactsRow?.saturdayClose
    ? `${weekdayLabel(locale, 6)}: ${contactsRow.saturdayOpen} – ${contactsRow.saturdayClose}`
    : '';

  const validate = (name: string, phone: string) => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = contact_valid_name();
    if (!/^[\+\d\s\-()]{6,}$/.test(phone.trim())) e.phone = contact_valid_phone();
    return e;
  };

  const inputBase = 'bg-bg-card border border-border rounded-input text-fg px-3.5 py-3 text-[14px] outline-none transition-[border-color] focus:border-accent w-full resize-y';
  const inputError = 'border-danger';
</script>

<section id="contacts" class="section bg-bg pb-10">
  <div class="container grid grid-cols-[1.05fr_1fr] gap-12 items-start max-md:grid-cols-1 max-md:gap-7">

    <div>
      <h2 class="text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[0.02em] mb-1.5">{contact_title()}</h2>
      <p class="text-[14px] text-fg-muted mb-5">{contact_subtitle()}</p>

      {#if submitted}
        <div class="flex gap-3 items-center bg-accent/10 border border-accent rounded-card p-5 text-accent max-w-[460px]">
          <Icon name="check" size={28}/>
          <p class="m-0">{contact_success()}</p>
        </div>
      {:else}
        <form
          class="flex flex-col gap-3 max-w-[460px] max-md:max-w-none"
          method="POST"
          novalidate
          use:enhance={({ formData, cancel }) => {
            const name = formData.get('name') as string ?? '';
            const phone = formData.get('phone') as string ?? '';
            clientErrors = validate(name, phone);
            if (Object.keys(clientErrors).length > 0) cancel();
          }}
        >
          <div class="flex flex-col gap-1">
            <input type="text" name="name" placeholder={contact_field_name()}
                   value={form?.name ?? ''}
                   class="{inputBase} {nameError ? inputError : ''}"/>
            {#if nameError}<span class="text-[12px] text-danger">{nameError}</span>{/if}
          </div>
          <div class="flex flex-col gap-1">
            <input type="tel" name="phone" placeholder={contact_field_phone()}
                   value={form?.phone ?? ''}
                   class="{inputBase} {phoneError ? inputError : ''}"/>
            {#if phoneError}<span class="text-[12px] text-danger">{phoneError}</span>{/if}
          </div>
          <div class="flex flex-col gap-1">
            <textarea name="comment" placeholder={contact_field_comment()} rows="3"
                      class={inputBase}>{form?.comment ?? ''}</textarea>
          </div>
          <button type="submit"
                  class="self-start inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn whitespace-nowrap hover:bg-accent-h hover:-translate-y-px transition-[background,transform]">
            {contact_field_submit()}
          </button>
        </form>
      {/if}
    </div>

    <div class="bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] p-7 flex flex-col gap-[18px]">
      <h3 class="text-[18px] font-extrabold tracking-[0.04em] m-0">{contact_contacts_title()}</h3>
      {#if contactsRow}
        <ul class="list-none p-0 m-0 flex flex-col gap-3">
          <li class="flex gap-3 items-center text-[14px]">
            <Icon name="phone" size={18}/><a href={contactsRow.phoneHref} class="hover:text-accent transition-colors">{contactsRow.phone}</a>
          </li>
          <li class="flex gap-3 items-center text-[14px]">
            <Icon name="mail" size={18}/><a href="mailto:{contactsRow.email}" class="hover:text-accent transition-colors">{contactsRow.email}</a>
          </li>
          <li class="flex gap-3 items-center text-[14px]">
            <Icon name="map" size={18}/><span>{contactsRow.address}</span>
          </li>
          <li class="flex gap-3 items-start text-[13px] font-mono">
            <span class="w-[18px] shrink-0 text-accent"><Icon name="clock" size={18}/></span>
            <div>
              <div>{weekdaysLine}</div>
              {#if saturdayLine}<div>{saturdayLine}</div>{/if}
            </div>
          </li>
        </ul>
      {/if}
      <div class="placeholder aspect-[16/8] mt-1.5">[ DPFLAB · фото мастерской / здания ]</div>
    </div>
  </div>
</section>
