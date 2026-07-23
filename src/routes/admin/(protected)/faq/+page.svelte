<script lang="ts">
  import { onMount } from 'svelte';
  import {
    admin_faq_title,
    admin_faq_add,
    admin_faq_question_ru,
    admin_faq_question_et,
    admin_faq_question_en,
    admin_faq_answer_ru,
    admin_faq_answer_et,
    admin_faq_answer_en,
    admin_action_add,
    admin_action_edit,
    admin_action_delete,
    admin_confirm_delete,
    admin_no_items,
    admin_error_required
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: rows = data.rows;

  onMount(() => {
    document.querySelectorAll<HTMLFormElement>('form[data-confirm]').forEach((f) => {
      f.addEventListener('submit', (e) => {
        if (!confirm(f.dataset.confirm)) e.preventDefault();
      });
    });
  });
</script>

<div class="max-w-3xl">
  <h1 class="text-2xl font-bold mb-6">{admin_faq_title()}</h1>

  {#if rows.length === 0}
    <p class="text-fg-muted text-sm mb-6">{admin_no_items()}</p>
  {:else}
    <div class="border border-border rounded-card overflow-hidden mb-8">
      {#each rows as row, i}
        <div
          class="flex items-center gap-3 px-4 py-3 bg-bg-card {i < rows.length - 1
            ? 'border-b border-border'
            : ''}"
        >
          <div class="flex flex-col gap-1 mr-1">
            <form method="POST" action="?/moveUp">
              <input type="hidden" name="id" value={row.id} />
              <button
                type="submit"
                disabled={i === 0}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move up"
              >
                ↑
              </button>
            </form>
            <form method="POST" action="?/moveDown">
              <input type="hidden" name="id" value={row.id} />
              <button
                type="submit"
                disabled={i === rows.length - 1}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move down"
              >
                ↓
              </button>
            </form>
          </div>

          <span class="flex-1 text-sm truncate">{row.questionRu}</span>

          <a
            href="/admin/faq/{row.id}"
            class="text-sm px-3 py-1.5 rounded-btn border border-border hover:bg-bg transition-colors"
          >
            {admin_action_edit()}
          </a>

          <form
            method="POST"
            action="?/delete"
            data-confirm={admin_confirm_delete()}
          >
            <input type="hidden" name="id" value={row.id} />
            <button
              type="submit"
              class="text-sm px-3 py-1.5 rounded-btn border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              {admin_action_delete()}
            </button>
          </form>
        </div>
      {/each}
    </div>
  {/if}

  <div class="bg-bg-card border border-border rounded-card p-5">
    <h2 class="font-semibold mb-4">{admin_faq_add()}</h2>
    <form method="POST" action="?/create" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label for="question_ru" class="block text-sm font-medium mb-1"
            >{admin_faq_question_ru()}</label
          >
          <textarea
            id="question_ru"
            name="question_ru"
            rows="2"
            value={form?.values?.questionRu ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
          ></textarea>
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
            value={form?.values?.questionEt ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
          ></textarea>
          {#if form?.errors?.question_et}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="question_en" class="block text-sm font-medium mb-1">{admin_faq_question_en()}</label>
          <textarea
            id="question_en"
            name="question_en"
            rows="2"
            value={form?.values?.questionEn ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
          ></textarea>
          {#if form?.errors?.question_en}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="answer_ru" class="block text-sm font-medium mb-1"
            >{admin_faq_answer_ru()}</label
          >
          <textarea
            id="answer_ru"
            name="answer_ru"
            rows="3"
            value={form?.values?.answerRu ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
          ></textarea>
          {#if form?.errors?.answer_ru}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="answer_et" class="block text-sm font-medium mb-1"
            >{admin_faq_answer_et()}</label
          >
          <textarea
            id="answer_et"
            name="answer_et"
            rows="3"
            value={form?.values?.answerEt ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
          ></textarea>
          {#if form?.errors?.answer_et}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
        <div>
          <label for="answer_en" class="block text-sm font-medium mb-1">{admin_faq_answer_en()}</label>
          <textarea
            id="answer_en"
            name="answer_en"
            rows="3"
            value={form?.values?.answerEn ?? ''}
            class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
          ></textarea>
          {#if form?.errors?.answer_en}
            <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
          {/if}
        </div>
      </div>
      <button
        type="submit"
        class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
      >
        {admin_action_add()}
      </button>
    </form>
  </div>
</div>
