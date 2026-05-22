<script lang="ts">
  import { onMount } from 'svelte';
  import {
    admin_reviews_title,
    admin_reviews_add,
    admin_reviews_stars,
    admin_reviews_text,
    admin_reviews_locale,
    admin_reviews_author,
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

  const STAR_ICONS = ['★', '★★', '★★★', '★★★★', '★★★★★'];

  onMount(() => {
    document.querySelectorAll<HTMLFormElement>('form[data-confirm]').forEach((f) => {
      f.addEventListener('submit', (e) => {
        if (!confirm(f.dataset.confirm)) e.preventDefault();
      });
    });

    const widget = document.getElementById('stars-widget');
    if (widget) {
      const labels = widget.querySelectorAll<HTMLElement>('.star-label');
      const icons = widget.querySelectorAll<HTMLElement>('.star-icon');
      function highlight(n: number) {
        icons.forEach((icon, i) => {
          icon.style.color = i < n ? 'var(--color-accent)' : '';
        });
      }
      labels.forEach((label, idx) => {
        const radio = label.querySelector<HTMLInputElement>('input[type=radio]')!;
        if (radio.checked) highlight(idx + 1);
        label.addEventListener('mouseenter', () => highlight(idx + 1));
        label.addEventListener('mouseleave', () => {
          const checked = widget.querySelector<HTMLInputElement>('input[type=radio]:checked');
          highlight(checked ? parseInt(checked.value) : 0);
        });
        radio.addEventListener('change', () => highlight(idx + 1));
      });
    }
  });
</script>

<div class="max-w-3xl">
  <h1 class="text-2xl font-bold mb-6">{admin_reviews_title()}</h1>

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
              <button type="submit" disabled={i === 0}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move up">↑</button>
            </form>
            <form method="POST" action="?/moveDown">
              <input type="hidden" name="id" value={row.id} />
              <button type="submit" disabled={i === rows.length - 1}
                class="text-xs px-1.5 py-0.5 border border-border rounded hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move down">↓</button>
            </form>
          </div>

          <span class="text-sm text-accent w-16 shrink-0">{STAR_ICONS[row.stars - 1]}</span>
          <span class="text-xs uppercase text-fg-muted w-6 shrink-0">{row.locale}</span>
          <span class="flex-1 text-sm truncate">{row.text} — {row.author}</span>

          <a href="/admin/reviews/{row.id}"
            class="text-sm px-3 py-1.5 rounded-btn border border-border hover:bg-bg transition-colors">
            {admin_action_edit()}
          </a>

          <form method="POST" action="?/delete" data-confirm={admin_confirm_delete()}>
            <input type="hidden" name="id" value={row.id} />
            <button type="submit"
              class="text-sm px-3 py-1.5 rounded-btn border border-danger text-danger hover:bg-danger/10 transition-colors cursor-pointer">
              {admin_action_delete()}
            </button>
          </form>
        </div>
      {/each}
    </div>
  {/if}

  <div class="bg-bg-card border border-border rounded-card p-5">
    <h2 class="font-semibold mb-4">{admin_reviews_add()}</h2>
    <form method="POST" action="?/create" class="space-y-4">
      <div>
        <span class="block text-sm font-medium mb-1">{admin_reviews_stars()}</span>
        <div class="flex gap-2" id="stars-widget" role="radiogroup" aria-label={admin_reviews_stars()}>
          {#each [1, 2, 3, 4, 5] as n}
            <label for="create-star-{n}" class="cursor-pointer text-2xl select-none star-label" data-value={n}>
              <input
                id="create-star-{n}"
                type="radio"
                name="stars"
                value={n}
                class="sr-only"
                checked={parseInt(form?.values?.starsRaw ?? '5', 10) === n}
              />
              <span class="star-icon text-fg-muted hover:text-accent">★</span>
            </label>
          {/each}
        </div>
        {#if form?.errors?.stars}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>

      <div>
        <label for="text" class="block text-sm font-medium mb-1">{admin_reviews_text()}</label>
        <textarea id="text" name="text" rows="3"
          value={form?.values?.text ?? ''}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
        ></textarea>
        {#if form?.errors?.text}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>

      <div>
        <label for="locale" class="block text-sm font-medium mb-1">{admin_reviews_locale()}</label>
        <select id="locale" name="locale"
          class="px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent">
          <option value="ru" selected={(form?.values?.locale ?? 'ru') === 'ru'}>RU — Русский</option>
          <option value="et" selected={(form?.values?.locale ?? 'ru') === 'et'}>ET — Eesti</option>
        </select>
      </div>

      <div>
        <label for="author" class="block text-sm font-medium mb-1">{admin_reviews_author()}</label>
        <input id="author" name="author" type="text" value={form?.values?.author ?? ''}
          class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
        {#if form?.errors?.author}
          <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
        {/if}
      </div>

      <button type="submit"
        class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
        {admin_action_add()}
      </button>
    </form>
  </div>
</div>
