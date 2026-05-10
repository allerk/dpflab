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
    if (Object.keys(errors).length === 0) {
      submitted = true;
      // TODO: submit to backend (SvelteKit form action or fetch)
    }
  };
</script>

<section id="contacts" class="section contact">
  <div class="container contact-grid">
    <div>
      <h2 class="contact-title">{t.contact.title}</h2>
      <p class="contact-sub">{t.contact.subtitle}</p>

      {#if submitted}
        <div class="contact-success">
          <Icon name="check" size={28}/>
          <p>{t.contact.success}</p>
        </div>
      {:else}
        <form class="contact-form" on:submit={onSubmit} novalidate>
          <div class="field">
            <input type="text" placeholder={t.contact.fields.name} bind:value={form.name} class:error={errors.name} />
            {#if errors.name}<span class="field-err">{errors.name}</span>{/if}
          </div>
          <div class="field">
            <input type="tel" placeholder={t.contact.fields.phone} bind:value={form.phone} class:error={errors.phone} />
            {#if errors.phone}<span class="field-err">{errors.phone}</span>{/if}
          </div>
          <div class="field">
            <textarea placeholder={t.contact.fields.comment} bind:value={form.comment} rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">{t.contact.fields.submit}</button>
        </form>
      {/if}
    </div>

    <div class="contact-info-wrap">
      <h3 class="contact-info-title">{t.contact.contactsTitle}</h3>
      <ul class="contact-info">
        <li><Icon name="phone" size={18}/><a href={t.contacts.phoneHref}>{t.contacts.phone}</a></li>
        <li><Icon name="mail" size={18}/><a href="mailto:{t.contacts.email}">{t.contacts.email}</a></li>
        <li><Icon name="map" size={18}/><span>{t.contacts.address}</span></li>
        <li class="contact-hours">
          <span></span>
          <div>
            <div>{t.contacts.hoursWeek}</div>
            <div>{t.contacts.hoursSat}</div>
          </div>
        </li>
      </ul>
      <div class="placeholder contact-photo">[ DPFLAB · фото мастерской / здания ]</div>
    </div>
  </div>
</section>
