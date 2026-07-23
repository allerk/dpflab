<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import Icon from '$lib/Icon.svelte';
  import type { ContactsRow } from '$lib/db/repositories/contacts';
  import {
    consentEventName,
    hasAnalyticsConsent,
    trackMetaEvent,
    trackMetaLead
  } from '$lib/analytics';
  import {
    contact_back,
    contact_client_fleet,
    contact_client_private,
    contact_client_type_label,
    contact_client_workshop,
    contact_contacts_title,
    contact_field_comment,
    contact_field_email,
    contact_field_name,
    contact_field_phone,
    contact_field_submit,
    contact_filter_installed,
    contact_filter_removed,
    contact_filter_state_label,
    contact_filter_unsure,
    contact_filter_workshop,
    contact_honeypot,
    contact_next,
    contact_preferred_email,
    contact_preferred_label,
    contact_preferred_phone,
    contact_preferred_whatsapp,
    contact_privacy_link,
    contact_privacy_prefix,
    contact_privacy_suffix,
    contact_route_installed_text,
    contact_route_installed_title,
    contact_route_note,
    contact_route_removed_text,
    contact_route_removed_title,
    contact_route_title,
    contact_route_unsure_text,
    contact_route_unsure_title,
    contact_route_waiting,
    contact_route_workshop_text,
    contact_route_workshop_title,
    contact_service_catalyst,
    contact_service_diagnosis,
    contact_service_dpf,
    contact_service_fap,
    contact_service_label,
    contact_service_other,
    contact_step_1_hint,
    contact_step_1_title,
    contact_step_2_hint,
    contact_step_2_title,
    contact_step_3_hint,
    contact_step_3_title,
    contact_step_counter,
    contact_success,
    contact_success_next,
    contact_success_title,
    contact_symptom_other,
    contact_symptom_power,
    contact_symptom_regeneration,
    contact_symptom_smoke,
    contact_symptom_warning,
    contact_symptoms_label,
    contact_title,
    contact_subtitle,
    contact_urgency_consultation,
    contact_urgency_days,
    contact_urgency_label,
    contact_urgency_today,
    contact_urgency_week,
    contact_valid_email,
    contact_valid_name,
    contact_valid_phone,
    contact_valid_privacy,
    contact_valid_required,
    contact_valid_vehicle,
    contact_vehicle_label,
    contact_vehicle_placeholder
  } from '$lib/paraglide/messages';

  type FormValues = {
    name?: string;
    phone?: string;
    email?: string;
    comment?: string;
    clientType?: string;
    serviceType?: string;
    filterState?: string;
    vehicle?: string;
    symptoms?: string[];
    urgency?: string;
    preferredContact?: string;
    privacyAccepted?: boolean;
  };

  type ContactActionData = {
    errors?: Record<string, string>;
    values?: FormValues;
    success?: boolean;
    eventId?: string;
  };

  type Message = () => string;

  export let contactsRow: ContactsRow | null = null;
  export let locale: string = 'et';
  export let form: ContactActionData | null = null;

  const TOTAL_STEPS = 3;
  const ATTRIBUTION_KEY = 'dpflab_attribution_v1';

  const serviceOptions: { value: string; label: Message }[] = [
    { value: 'dpf', label: contact_service_dpf },
    { value: 'fap', label: contact_service_fap },
    { value: 'catalyst', label: contact_service_catalyst },
    { value: 'diagnosis', label: contact_service_diagnosis },
    { value: 'other', label: contact_service_other }
  ];

  const filterOptions: { value: string; label: Message }[] = [
    { value: 'removed', label: contact_filter_removed },
    { value: 'workshop', label: contact_filter_workshop },
    { value: 'installed', label: contact_filter_installed },
    { value: 'unsure', label: contact_filter_unsure }
  ];

  const clientOptions: { value: string; label: Message }[] = [
    { value: 'private', label: contact_client_private },
    { value: 'workshop', label: contact_client_workshop },
    { value: 'fleet', label: contact_client_fleet }
  ];

  const symptomOptions: { value: string; label: Message }[] = [
    { value: 'warning', label: contact_symptom_warning },
    { value: 'power', label: contact_symptom_power },
    { value: 'regeneration', label: contact_symptom_regeneration },
    { value: 'smoke', label: contact_symptom_smoke },
    { value: 'other', label: contact_symptom_other }
  ];

  const urgencyOptions: { value: string; label: Message }[] = [
    { value: 'today', label: contact_urgency_today },
    { value: 'days_1_3', label: contact_urgency_days },
    { value: 'this_week', label: contact_urgency_week },
    { value: 'consultation', label: contact_urgency_consultation }
  ];

  const contactOptions: { value: string; label: Message; icon: string }[] = [
    { value: 'phone', label: contact_preferred_phone, icon: 'phone' },
    { value: 'whatsapp', label: contact_preferred_whatsapp, icon: 'whatsapp' },
    { value: 'email', label: contact_preferred_email, icon: 'mail' }
  ];

  const routes: Record<string, { title: Message; text: Message; icon: string }> = {
    removed: { title: contact_route_removed_title, text: contact_route_removed_text, icon: 'filter' },
    workshop: { title: contact_route_workshop_title, text: contact_route_workshop_text, icon: 'truck' },
    installed: { title: contact_route_installed_title, text: contact_route_installed_text, icon: 'car' },
    unsure: { title: contact_route_unsure_title, text: contact_route_unsure_text, icon: 'search' }
  };

  let step = 1;
  let submitted = false;
  let started = false;
  let trackedEventId = '';
  let handledForm: ContactActionData | null = null;
  let clientErrors: Record<string, string> = {};

  let name = '';
  let phone = '';
  let email = '';
  let comment = '';
  let clientType = '';
  let serviceType = '';
  let filterState = '';
  let vehicle = '';
  let symptoms: string[] = [];
  let urgency = '';
  let preferredContact = '';
  let privacyAccepted = false;
  let analyticsConsent = false;

  let utmSource = '';
  let utmMedium = '';
  let utmCampaign = '';
  let utmContent = '';
  let utmTerm = '';
  let fbclid = '';
  let landingPage = '';
  let referrer = '';

  $: currentRoute = routes[filterState];
  $: progress = `${(step / TOTAL_STEPS) * 100}%`;

  $: if (form && form !== handledForm) {
    handledForm = form;
    if (form.values) {
      name = form.values.name ?? name;
      phone = form.values.phone ?? phone;
      email = form.values.email ?? email;
      comment = form.values.comment ?? comment;
      clientType = form.values.clientType ?? clientType;
      serviceType = form.values.serviceType ?? serviceType;
      filterState = form.values.filterState ?? filterState;
      vehicle = form.values.vehicle ?? vehicle;
      symptoms = form.values.symptoms ?? symptoms;
      urgency = form.values.urgency ?? urgency;
      preferredContact = form.values.preferredContact ?? preferredContact;
      privacyAccepted = form.values.privacyAccepted ?? privacyAccepted;
    }
    if (form.errors) {
      clientErrors = form.errors;
      if (form.errors.serviceType || form.errors.filterState) step = 1;
      else if (form.errors.clientType || form.errors.vehicle || form.errors.urgency) step = 2;
      else step = 3;
    }
    if (form.success) submitted = true;
    if (form.success && form.eventId && form.eventId !== trackedEventId) {
      trackedEventId = form.eventId;
      trackMetaLead(form.eventId);
    }
  }

  // 2024-01-01 is Monday; mondayOffset 1=Mon ... 6=Sat lands on 2024-01-{offset}
  const weekdayLabel = (language: string, mondayOffset: number) => {
    const date = new Date(Date.UTC(2024, 0, mondayOffset));
    const label = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  $: weekdaysLine = contactsRow
    ? `${weekdayLabel(locale, 1)} – ${weekdayLabel(locale, 5)}: ${contactsRow.weekdaysOpen} – ${contactsRow.weekdaysClose}`
    : '';

  $: saturdayLine = contactsRow?.saturdayOpen && contactsRow?.saturdayClose
    ? `${weekdayLabel(locale, 6)}: ${contactsRow.saturdayOpen} – ${contactsRow.saturdayClose}`
    : '';

  onMount(() => {
    analyticsConsent = hasAnalyticsConsent();

    const params = new URLSearchParams(window.location.search);
    let stored: Record<string, string> = {};
    try {
      stored = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) ?? '{}') as Record<string, string>;
    } catch {
      stored = {};
    }

    const attribution = {
      utmSource: params.get('utm_source') ?? stored.utmSource ?? '',
      utmMedium: params.get('utm_medium') ?? stored.utmMedium ?? '',
      utmCampaign: params.get('utm_campaign') ?? stored.utmCampaign ?? '',
      utmContent: params.get('utm_content') ?? stored.utmContent ?? '',
      utmTerm: params.get('utm_term') ?? stored.utmTerm ?? '',
      fbclid: params.get('fbclid') ?? stored.fbclid ?? '',
      landingPage: stored.landingPage ?? `${window.location.pathname}${window.location.search}`,
      referrer: stored.referrer ?? document.referrer
    };

    ({ utmSource, utmMedium, utmCampaign, utmContent, utmTerm, fbclid, landingPage, referrer } = attribution);
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));

    const updateConsent = (event: Event) => {
      analyticsConsent = (event as CustomEvent).detail === 'accepted';
    };
    window.addEventListener(consentEventName(), updateConsent);
    return () => window.removeEventListener(consentEventName(), updateConsent);
  });

  function markStarted() {
    if (started) return;
    started = true;
    trackMetaEvent('LeadFormStart', { locale });
  }

  function errorMessage(field: string): string {
    if (!clientErrors[field]) return '';
    if (field === 'name') return contact_valid_name();
    if (field === 'phone') return contact_valid_phone();
    if (field === 'email') return contact_valid_email();
    if (field === 'vehicle') return contact_valid_vehicle();
    if (field === 'privacyAccepted') return contact_valid_privacy();
    return contact_valid_required();
  }

  function validateStep(currentStep: number): boolean {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!serviceType) errors.serviceType = 'required';
      if (!filterState) errors.filterState = 'required';
    }

    if (currentStep === 2) {
      if (!clientType) errors.clientType = 'required';
      if (!vehicle.trim()) errors.vehicle = 'required';
      if (!urgency) errors.urgency = 'required';
    }

    if (currentStep === 3) {
      if (!name.trim()) errors.name = 'required';
      if (!/^[+\d\s\-()]{6,}$/.test(phone.trim())) errors.phone = 'required';
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'invalid';
      if (preferredContact === 'email' && !email.trim()) errors.email = 'required';
      if (!preferredContact) errors.preferredContact = 'required';
      if (!privacyAccepted) errors.privacyAccepted = 'required';
    }

    clientErrors = { ...clientErrors, ...errors };
    for (const key of Object.keys(clientErrors)) {
      if (!errors[key] && (
        (currentStep === 1 && ['serviceType', 'filterState'].includes(key)) ||
        (currentStep === 2 && ['clientType', 'vehicle', 'urgency'].includes(key)) ||
        (currentStep === 3 && ['name', 'phone', 'email', 'preferredContact', 'privacyAccepted'].includes(key))
      )) {
        delete clientErrors[key];
      }
    }
    clientErrors = { ...clientErrors };
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    markStarted();
    if (!validateStep(step)) return;
    trackMetaEvent('LeadFormStep', { locale, completed_step: step, filter_state: filterState || 'unknown' });
    step = Math.min(TOTAL_STEPS, step + 1);
  }

  function previousStep() {
    step = Math.max(1, step - 1);
  }

  function firstInvalidStep(): number {
    if (!validateStep(1)) return 1;
    if (!validateStep(2)) return 2;
    if (!validateStep(3)) return 3;
    return 0;
  }

  const inputBase = 'bg-bg border border-border rounded-input text-fg px-3.5 py-3 text-[14px] outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,211,33,.12)] w-full resize-y';
  const inputError = 'border-danger';
  const tileBase = 'relative flex min-h-[52px] items-center gap-2.5 border rounded-input px-3.5 py-3 text-[13px] leading-snug cursor-pointer transition-[border-color,background,color,transform] hover:-translate-y-px focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg-card';
</script>

<section id="contacts" class="section bg-bg pb-10">
  <div class="container">
    <div class="mb-8 max-w-[760px]">
      <div class="font-mono text-[11px] tracking-[0.18em] text-accent mb-3">DPFLAB / SERVICE INTAKE</div>
      <h2 class="text-[clamp(30px,4.6vw,54px)] leading-[1.02] font-black tracking-[-0.03em] mb-3">{contact_title()}</h2>
      <p class="text-[15px] text-fg-muted max-w-[660px]">{contact_subtitle()}</p>
    </div>

    <div class="grid grid-cols-[minmax(0,1.45fr)_minmax(290px,.75fr)] gap-7 items-start max-md:grid-cols-1">
      <div class="bg-bg-card border border-border rounded-card overflow-hidden shadow-[0_14px_45px_rgba(0,0,0,.22)]">
        {#if submitted}
          <div class="min-h-[520px] p-8 flex flex-col justify-center items-start max-xs:p-5">
            <div class="w-14 h-14 rounded-full bg-accent text-accent-fg flex items-center justify-center mb-6">
              <Icon name="check" size={28}/>
            </div>
            <div class="font-mono text-[11px] tracking-[0.16em] text-accent mb-3">REQUEST / RECEIVED</div>
            <h3 class="text-[clamp(27px,4vw,40px)] font-black tracking-[-0.025em] mb-3">{contact_success_title()}</h3>
            <p class="text-[15px] leading-relaxed text-fg-muted max-w-[580px]">{contact_success()}</p>
            <p class="mt-5 text-[13px] text-fg-muted">{contact_success_next()}</p>
            {#if contactsRow}
              <div class="flex flex-wrap gap-2.5 mt-6">
                <a href={contactsRow.phoneHref} class="inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[13px] px-4 py-2.5 rounded-btn">
                  <Icon name="phone" size={16}/>{contactsRow.phone}
                </a>
                <a href={contactsRow.whatsapp} target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 border border-border font-semibold text-[13px] px-4 py-2.5 rounded-btn hover:border-accent transition-colors">
                  <Icon name="whatsapp" size={16}/>WhatsApp
                </a>
              </div>
            {/if}
          </div>
        {:else}
          <div class="px-7 pt-6 max-xs:px-4 max-xs:pt-5">
            <div class="flex items-center justify-between gap-4 mb-3">
              <span class="font-mono text-[11px] tracking-[0.12em] text-fg-muted">
                {contact_step_counter({ current: step, total: TOTAL_STEPS })}
              </span>
              <div class="flex gap-1.5" aria-hidden="true">
                {#each Array(TOTAL_STEPS) as _, index}
                  <span class="w-7 h-1 rounded-full transition-colors {index < step ? 'bg-accent' : 'bg-border'}"></span>
                {/each}
              </div>
            </div>
            <div class="h-px bg-border relative">
              <div class="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300" style:width={progress}></div>
            </div>
          </div>

          <form
            class="p-7 pt-6 max-xs:p-4 max-xs:pt-5"
            method="POST"
            novalidate
            on:change={markStarted}
            use:enhance={({ formData, cancel }) => {
              const invalidStep = firstInvalidStep();
              if (invalidStep) {
                step = invalidStep;
                cancel();
                return;
              }

              formData.set('analyticsConsent', analyticsConsent ? 'yes' : 'no');
              return async ({ update }) => {
                await update({ reset: false });
              };
            }}
          >
            <input type="hidden" name="utmSource" value={utmSource} />
            <input type="hidden" name="utmMedium" value={utmMedium} />
            <input type="hidden" name="utmCampaign" value={utmCampaign} />
            <input type="hidden" name="utmContent" value={utmContent} />
            <input type="hidden" name="utmTerm" value={utmTerm} />
            <input type="hidden" name="fbclid" value={fbclid} />
            <input type="hidden" name="landingPage" value={landingPage} />
            <input type="hidden" name="referrer" value={referrer} />

            <div class="absolute left-[-9999px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
              <label for="website">{contact_honeypot()}</label>
              <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
            </div>

            <section class:hidden={step !== 1} aria-hidden={step !== 1}>
              <h3 class="text-[24px] font-extrabold mb-1">{contact_step_1_title()}</h3>
              <p class="text-[13px] text-fg-muted mb-6">{contact_step_1_hint()}</p>

              <fieldset class="mb-6">
                <legend class="text-[13px] font-semibold mb-2.5">{contact_service_label()}</legend>
                <div class="grid grid-cols-2 gap-2.5 max-xs:grid-cols-1">
                  {#each serviceOptions as option}
                    <label class="{tileBase} {serviceType === option.value ? 'border-accent bg-accent/[.08] text-fg' : 'border-border bg-bg text-fg-muted'}">
                      <input class="sr-only" type="radio" name="serviceType" value={option.value} bind:group={serviceType} />
                      <span class="w-2 h-2 rounded-full shrink-0 {serviceType === option.value ? 'bg-accent shadow-[0_0_0_4px_rgba(126,211,33,.14)]' : 'bg-border'}"></span>
                      <span>{option.label()}</span>
                    </label>
                  {/each}
                </div>
                {#if errorMessage('serviceType')}<span class="block mt-2 text-[12px] text-danger">{errorMessage('serviceType')}</span>{/if}
              </fieldset>

              <fieldset>
                <legend class="text-[13px] font-semibold mb-2.5">{contact_filter_state_label()}</legend>
                <div class="grid grid-cols-2 gap-2.5 max-xs:grid-cols-1">
                  {#each filterOptions as option}
                    <label class="{tileBase} {filterState === option.value ? 'border-accent bg-accent/[.08] text-fg' : 'border-border bg-bg text-fg-muted'}">
                      <input class="sr-only" type="radio" name="filterState" value={option.value} bind:group={filterState} />
                      <span class="w-2 h-2 rounded-full shrink-0 {filterState === option.value ? 'bg-accent shadow-[0_0_0_4px_rgba(126,211,33,.14)]' : 'bg-border'}"></span>
                      <span>{option.label()}</span>
                    </label>
                  {/each}
                </div>
                {#if errorMessage('filterState')}<span class="block mt-2 text-[12px] text-danger">{errorMessage('filterState')}</span>{/if}
              </fieldset>
            </section>

            <section class:hidden={step !== 2} aria-hidden={step !== 2}>
              <h3 class="text-[24px] font-extrabold mb-1">{contact_step_2_title()}</h3>
              <p class="text-[13px] text-fg-muted mb-6">{contact_step_2_hint()}</p>

              <fieldset class="mb-5">
                <legend class="text-[13px] font-semibold mb-2.5">{contact_client_type_label()}</legend>
                <div class="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
                  {#each clientOptions as option}
                    <label class="{tileBase} {clientType === option.value ? 'border-accent bg-accent/[.08] text-fg' : 'border-border bg-bg text-fg-muted'}">
                      <input class="sr-only" type="radio" name="clientType" value={option.value} bind:group={clientType} />
                      <span class="w-2 h-2 rounded-full shrink-0 {clientType === option.value ? 'bg-accent' : 'bg-border'}"></span>
                      <span>{option.label()}</span>
                    </label>
                  {/each}
                </div>
                {#if errorMessage('clientType')}<span class="block mt-2 text-[12px] text-danger">{errorMessage('clientType')}</span>{/if}
              </fieldset>

              <div class="mb-5">
                <label for="vehicle" class="block text-[13px] font-semibold mb-2">{contact_vehicle_label()}</label>
                <input
                  id="vehicle"
                  name="vehicle"
                  type="text"
                  bind:value={vehicle}
                  placeholder={contact_vehicle_placeholder()}
                  maxlength="240"
                  class="{inputBase} {errorMessage('vehicle') ? inputError : ''}"
                />
                {#if errorMessage('vehicle')}<span class="block mt-1.5 text-[12px] text-danger">{errorMessage('vehicle')}</span>{/if}
              </div>

              <fieldset class="mb-5">
                <legend class="text-[13px] font-semibold mb-2.5">{contact_symptoms_label()}</legend>
                <div class="flex flex-wrap gap-2">
                  {#each symptomOptions as option}
                    <label class="inline-flex items-center gap-2 border rounded-full px-3 py-2 text-[12px] cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg-card {symptoms.includes(option.value) ? 'border-accent bg-accent/[.08] text-fg' : 'border-border bg-bg text-fg-muted'}">
                      <input class="sr-only" type="checkbox" name="symptoms" value={option.value} bind:group={symptoms} />
                      <span class="w-1.5 h-1.5 rounded-full {symptoms.includes(option.value) ? 'bg-accent' : 'bg-border'}"></span>
                      {option.label()}
                    </label>
                  {/each}
                </div>
              </fieldset>

              <fieldset>
                <legend class="text-[13px] font-semibold mb-2.5">{contact_urgency_label()}</legend>
                <div class="grid grid-cols-2 gap-2.5 max-xs:grid-cols-1">
                  {#each urgencyOptions as option}
                    <label class="{tileBase} {urgency === option.value ? 'border-accent bg-accent/[.08] text-fg' : 'border-border bg-bg text-fg-muted'}">
                      <input class="sr-only" type="radio" name="urgency" value={option.value} bind:group={urgency} />
                      <span class="w-2 h-2 rounded-full shrink-0 {urgency === option.value ? 'bg-accent' : 'bg-border'}"></span>
                      <span>{option.label()}</span>
                    </label>
                  {/each}
                </div>
                {#if errorMessage('urgency')}<span class="block mt-2 text-[12px] text-danger">{errorMessage('urgency')}</span>{/if}
              </fieldset>
            </section>

            <section class:hidden={step !== 3} aria-hidden={step !== 3}>
              <h3 class="text-[24px] font-extrabold mb-1">{contact_step_3_title()}</h3>
              <p class="text-[13px] text-fg-muted mb-6">{contact_step_3_hint()}</p>

              <fieldset class="mb-5">
                <legend class="text-[13px] font-semibold mb-2.5">{contact_preferred_label()}</legend>
                <div class="grid grid-cols-3 gap-2.5 max-xs:grid-cols-1">
                  {#each contactOptions as option}
                    <label class="{tileBase} justify-center {preferredContact === option.value ? 'border-accent bg-accent/[.08] text-fg' : 'border-border bg-bg text-fg-muted'}">
                      <input class="sr-only" type="radio" name="preferredContact" value={option.value} bind:group={preferredContact} />
                      <Icon name={option.icon} size={16}/>
                      <span>{option.label()}</span>
                    </label>
                  {/each}
                </div>
                {#if errorMessage('preferredContact')}<span class="block mt-2 text-[12px] text-danger">{errorMessage('preferredContact')}</span>{/if}
              </fieldset>

              <div class="grid grid-cols-2 gap-3 mb-3 max-xs:grid-cols-1">
                <div>
                  <label for="contact-name" class="sr-only">{contact_field_name()}</label>
                  <input id="contact-name" type="text" name="name" bind:value={name} autocomplete="name" placeholder={contact_field_name()} maxlength="100"
                         class="{inputBase} {errorMessage('name') ? inputError : ''}"/>
                  {#if errorMessage('name')}<span class="block mt-1.5 text-[12px] text-danger">{errorMessage('name')}</span>{/if}
                </div>
                <div>
                  <label for="contact-phone" class="sr-only">{contact_field_phone()}</label>
                  <input id="contact-phone" type="tel" name="phone" bind:value={phone} autocomplete="tel" placeholder={contact_field_phone()} maxlength="40"
                         class="{inputBase} {errorMessage('phone') ? inputError : ''}"/>
                  {#if errorMessage('phone')}<span class="block mt-1.5 text-[12px] text-danger">{errorMessage('phone')}</span>{/if}
                </div>
              </div>

              <div class="mb-3">
                <label for="contact-email" class="sr-only">{contact_field_email()}</label>
                <input id="contact-email" type="email" name="email" bind:value={email} autocomplete="email" placeholder={contact_field_email()} maxlength="160"
                       class="{inputBase} {errorMessage('email') ? inputError : ''}"/>
                {#if errorMessage('email')}<span class="block mt-1.5 text-[12px] text-danger">{errorMessage('email')}</span>{/if}
              </div>

              <div class="mb-4">
                <label for="contact-comment" class="sr-only">{contact_field_comment()}</label>
                <textarea id="contact-comment" name="comment" bind:value={comment} placeholder={contact_field_comment()} rows="3" maxlength="1500"
                          class={inputBase}></textarea>
              </div>

              <label class="flex gap-3 items-start text-[12px] leading-relaxed text-fg-muted cursor-pointer">
                <input
                  type="checkbox"
                  name="privacyAccepted"
                  value="yes"
                  bind:checked={privacyAccepted}
                  class="mt-0.5 w-4 h-4 shrink-0 accent-accent"
                />
                <span>
                  {contact_privacy_prefix()}
                  <a href={locale === 'ru' ? '/privacy' : `/${locale}/privacy`} class="text-fg underline underline-offset-2 hover:text-accent">
                    {contact_privacy_link()}
                  </a>
                  {contact_privacy_suffix()}
                </span>
              </label>
              {#if errorMessage('privacyAccepted')}<span class="block mt-1.5 text-[12px] text-danger">{errorMessage('privacyAccepted')}</span>{/if}
            </section>

            <div class="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-border">
              {#if step > 1}
                <button type="button" on:click={previousStep} class="inline-flex items-center gap-2 text-[13px] text-fg-muted hover:text-fg transition-colors px-1 py-2">
                  ← {contact_back()}
                </button>
              {:else}
                <span></span>
              {/if}

              {#if step < TOTAL_STEPS}
                <button type="button" on:click={nextStep}
                        class="inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[14px] px-5 py-3 rounded-btn hover:bg-accent-h hover:-translate-y-px transition-[background,transform]">
                  {contact_next()} →
                </button>
              {:else}
                <button type="submit"
                        class="inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[14px] px-5 py-3 rounded-btn hover:bg-accent-h hover:-translate-y-px transition-[background,transform]">
                  {contact_field_submit()} <Icon name="arrow-right" size={16}/>
                </button>
              {/if}
            </div>
          </form>
        {/if}
      </div>

      <div class="sticky top-24 flex flex-col gap-4 max-md:static">
        <div class="relative overflow-hidden bg-[#111] border border-border rounded-card p-6 min-h-[235px]">
          <div class="absolute -right-12 -top-12 w-36 h-36 rounded-full border border-accent/20"></div>
          <div class="absolute -right-5 -top-5 w-20 h-20 rounded-full border border-accent/10"></div>
          <div class="font-mono text-[10px] tracking-[0.18em] text-accent mb-5">{contact_route_title()}</div>

          {#if currentRoute}
            <div class="w-11 h-11 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mb-4">
              <Icon name={currentRoute.icon} size={22}/>
            </div>
            <h3 class="text-[19px] font-extrabold mb-2 max-w-[240px]">{currentRoute.title()}</h3>
            <p class="text-[13px] leading-relaxed text-fg-muted max-w-[280px]">{currentRoute.text()}</p>
          {:else}
            <div class="h-11 w-11 rounded-full border border-dashed border-border flex items-center justify-center text-fg-muted mb-4">
              <span class="font-mono text-[14px]">?</span>
            </div>
            <p class="text-[13px] leading-relaxed text-fg-muted max-w-[280px]">{contact_route_waiting()}</p>
          {/if}

          <div class="mt-5 pt-4 border-t border-border text-[11px] leading-relaxed text-fg-muted">{contact_route_note()}</div>
        </div>

        <div class="bg-bg-card border border-border rounded-card p-6">
          <h3 class="text-[15px] font-extrabold tracking-[0.06em] mb-4">{contact_contacts_title()}</h3>
          {#if contactsRow}
            <ul class="list-none p-0 m-0 flex flex-col gap-3">
              <li class="flex gap-3 items-center text-[13px]">
                <Icon name="phone" size={17}/><a href={contactsRow.phoneHref} class="hover:text-accent transition-colors">{contactsRow.phone}</a>
              </li>
              <li class="flex gap-3 items-center text-[13px]">
                <Icon name="whatsapp" size={17}/><a href={contactsRow.whatsapp} target="_blank" rel="noreferrer" class="hover:text-accent transition-colors">WhatsApp</a>
              </li>
              <li class="flex gap-3 items-center text-[13px]">
                <Icon name="mail" size={17}/><a href="mailto:{contactsRow.email}" class="hover:text-accent transition-colors">{contactsRow.email}</a>
              </li>
              <li class="flex gap-3 items-start text-[12px] text-fg-muted">
                <Icon name="map" size={17}/><span>{contactsRow.address}</span>
              </li>
              <li class="flex gap-3 items-start text-[11px] font-mono text-fg-muted">
                <span class="w-[17px] shrink-0 text-accent"><Icon name="clock" size={17}/></span>
                <div>
                  <div>{weekdaysLine}</div>
                  {#if saturdayLine}<div>{saturdayLine}</div>{/if}
                </div>
              </li>
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
