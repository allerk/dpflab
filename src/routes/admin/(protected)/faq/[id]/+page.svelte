<script lang="ts">
  import {
    admin_faq_title,
    admin_faq_question_ru,
    admin_faq_question_et,
    admin_faq_answer_ru,
    admin_faq_answer_et,
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
  <a href="/admin/faq" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>
  <h1 class="text-2xl font-bold mb-6">{admin_faq_title()} — #{row.id}</h1>

  <form method="POST" action="?/update" class="bg-bg-card border border-border rounded-card p-5 space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label for="question_ru" class="block text-sm font-medium mb-1"
          >{admin_faq_question_ru()}</label
        >
        <textarea
          id="question_ru"
          name="question_ru"
          rows="2"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.questionRu ?? row.questionRu}</textarea>
        {#if form?.errors?.question_ru}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="question_et" class="block text-sm font-medium mb-1"
          >{admin_faq_question_et()}</label
        >
        <textarea
          id="question_et"
          name="question_et"
          rows="2"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.questionEt ?? row.questionEt}</textarea>
        {#if form?.errors?.question_et}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="answer_ru" class="block text-sm font-medium mb-1">{admin_faq_answer_ru()}</label>
        <textarea
          id="answer_ru"
          name="answer_ru"
          rows="4"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.answerRu ?? row.answerRu}</textarea>
        {#if form?.errors?.answer_ru}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
      <div>
        <label for="answer_et" class="block text-sm font-medium mb-1">{admin_faq_answer_et()}</label>
        <textarea
          id="answer_et"
          name="answer_et"
          rows="4"
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        >{form?.values?.answerEt ?? row.answerEt}</textarea>
        {#if form?.errors?.answer_et}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>
    </div>
    <button
      type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
    >
      {admin_action_save()}
    </button>
  </form>
</div>
