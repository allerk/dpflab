<script lang="ts">
  import type { ContentBundle } from '$lib/types';
  import Icon from '$lib/Icon.svelte';
  export let t: ContentBundle;

  let form = { name: '', phone: '', comment: '' };
  let errors: { name?: string; phone?: string } = {};
  let submitted = false;

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = t.contact.validation.name;
    if (!/^[\+\d\s\-()]{6,}$/.test(form.phone.trim())) e.phone = t.contact.validation.phone;
    return e;
  };

  const onSubmit = (ev: Event) => {
    ev.preventDefault();
    errors = validate();
    if (Object.keys(errors).length === 0) submitted = true;
  };

  const inputBase = 'bg-bg-card border border-border rounded-input text-fg px-3.5 py-3 text-[14px] outline-none transition-[border-color] focus:border-accent w-full resize-y';
  const inputError = 'border-danger';
</script>

<section id="contacts" class="section bg-bg pb-10">
  <div class="container grid grid-cols-[1.05fr_1fr] gap-12 items-start max-sm:grid-cols-1 max-sm:gap-7">

    <div>
      <h2 class="text-[clamp(24px,2.6vw,32px)] font-black tracking-wide mb-1.5">{t.contact.title}</h2>
      <p class="text-[14px] text-fg-muted mb-5">{t.contact.subtitle}</p>

      {#if submitted}
        <div class="flex gap-3 items-center bg-accent/10 border border-accent rounded-card p-5 text-accent max-w-[460px]">
          <Icon name="check" size={28}/>
          <p class="m-0">{t.contact.success}</p>
        </div>
      {:else}
        <form class="flex flex-col gap-3 max-w-[460px] max-sm:max-w-none" on:submit={onSubmit} novalidate>
          <div class="flex flex-col gap-1">
            <input type="text" placeholder={t.contact.fields.name} bind:value={form.name}
                   class="{inputBase} {errors.name ? inputError : ''}"/>
            {#if errors.name}<span class="text-[12px] text-danger">{errors.name}</span>{/if}
          </div>
          <div class="flex flex-col gap-1">
            <input type="tel" placeholder={t.contact.fields.phone} bind:value={form.phone}
                   class="{inputBase} {errors.phone ? inputError : ''}"/>
            {#if errors.phone}<span class="text-[12px] text-danger">{errors.phone}</span>{/if}
          </div>
          <div class="flex flex-col gap-1">
            <textarea placeholder={t.contact.fields.comment} bind:value={form.comment} rows="3"
                      class={inputBase}></textarea>
          </div>
          <button type="submit"
                  class="self-start inline-flex items-center gap-2 bg-accent text-accent-fg font-semibold text-[15px] px-6 py-3.5 rounded-btn hover:bg-accent-h hover:-translate-y-px transition-[background,transform]">
            {t.contact.fields.submit}
          </button>
        </form>
      {/if}
    </div>

    <div class="bg-bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,.3)] p-7 flex flex-col gap-[18px]">
      <h3 class="text-[18px] font-black tracking-wide m-0">{t.contact.contactsTitle}</h3>
      <ul class="list-none p-0 m-0 flex flex-col gap-3">
        <li class="flex gap-3 items-center text-[14px]">
          <Icon name="phone" size={18} /><a href={t.contacts.phoneHref} class="hover:text-accent transition-colors">{t.contacts.phone}</a>
        </li>
        <li class="flex gap-3 items-center text-[14px]">
          <Icon name="mail" size={18}/><a href="mailto:{t.contacts.email}" class="hover:text-accent transition-colors">{t.contacts.email}</a>
        </li>
        <li class="flex gap-3 items-center text-[14px]">
          <Icon name="map" size={18}/><span>{t.contacts.address}</span>
        </li>
        <li class="flex gap-3 items-start text-[13px] font-mono">
          <span class="w-[18px] shrink-0 text-accent"><Icon name="clock" size={18}/></span>
          <div>
            <div>{t.contacts.hoursWeek}</div>
            <div>{t.contacts.hoursSat}</div>
          </div>
        </li>
      </ul>
      <div class="placeholder aspect-[16/8] mt-1.5">[ DPFLAB · фото мастерской / здания ]</div>
    </div>
  </div>
</section>
