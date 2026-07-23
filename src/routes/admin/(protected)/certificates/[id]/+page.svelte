<script lang="ts">
  import {
    admin_certificates_title,
    admin_certificates_title_ru,
    admin_certificates_title_et,
    admin_certificates_title_en,
    admin_certificates_text_ru,
    admin_certificates_text_et,
    admin_certificates_text_en,
    admin_action_save,
    admin_action_back,
    admin_error_required
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: row = data.row;
</script>

<div class="max-w-2xl">
  <a href="/admin/certificates" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>
  <h1 class="text-2xl font-bold mb-6">{admin_certificates_title()} — #{row.id}</h1>

  <form method="POST" action="?/update" class="bg-bg-card border border-border rounded-card p-5 space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label for="title_ru" class="block text-sm font-medium mb-1">{admin_certificates_title_ru()}</label>
        <input id="title_ru" name="title_ru" type="text" value={form?.values?.titleRu ?? row.titleRu}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.title_ru}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="title_et" class="block text-sm font-medium mb-1">{admin_certificates_title_et()}</label>
        <input id="title_et" name="title_et" type="text" value={form?.values?.titleEt ?? row.titleEt}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.title_et}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="title_en" class="block text-sm font-medium mb-1">{admin_certificates_title_en()}</label>
        <input id="title_en" name="title_en" type="text" value={form?.values?.titleEn ?? row.titleEn}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.title_en}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="text_ru" class="block text-sm font-medium mb-1">{admin_certificates_text_ru()}</label>
        <textarea id="text_ru" name="text_ru" rows="3"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.textRu ?? row.textRu}</textarea>
        {#if form?.errors?.text_ru}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="text_et" class="block text-sm font-medium mb-1">{admin_certificates_text_et()}</label>
        <textarea id="text_et" name="text_et" rows="3"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.textEt ?? row.textEt}</textarea>
        {#if form?.errors?.text_et}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="text_en" class="block text-sm font-medium mb-1">{admin_certificates_text_en()}</label>
        <textarea id="text_en" name="text_en" rows="3"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.textEn ?? row.textEn}</textarea>
        {#if form?.errors?.text_en}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
    </div>
    <button type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
      {admin_action_save()}
    </button>
  </form>
</div>
