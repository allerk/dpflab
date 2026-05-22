<script lang="ts">
  import { onMount } from 'svelte';
  import {
    admin_reviews_title,
    admin_reviews_stars,
    admin_reviews_text,
    admin_reviews_locale,
    admin_reviews_author,
    admin_action_save,
    admin_action_back,
    admin_error_required
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: row = data.row;
  $: currentStars = parseInt(form?.values?.starsRaw ?? String(row.stars), 10);

  onMount(() => {
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

<div class="max-w-2xl">
  <a href="/admin/reviews" class="text-sm text-fg-muted hover:text-fg mb-4 inline-block">
    {admin_action_back()}
  </a>
  <h1 class="text-2xl font-bold mb-6">{admin_reviews_title()} — #{row.id}</h1>

  <form method="POST" action="?/update" class="bg-bg-card border border-border rounded-card p-5 space-y-4">
    <div>
      <span class="block text-sm font-medium mb-1">{admin_reviews_stars()}</span>
      <div class="flex gap-2" id="stars-widget" role="radiogroup" aria-label={admin_reviews_stars()}>
        {#each [1, 2, 3, 4, 5] as n}
          <label for="star-{n}" class="cursor-pointer text-2xl select-none star-label" data-value={n}>
            <input
              id="star-{n}"
              type="radio"
              name="stars"
              value={n}
              class="sr-only"
              checked={currentStars === n}
            />
            <span class="star-icon" style="color: {n <= currentStars ? 'var(--color-accent)' : ''}">★</span>
          </label>
        {/each}
      </div>
      {#if form?.errors?.stars}
        <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
      {/if}
    </div>

    <div>
      <label for="text" class="block text-sm font-medium mb-1">{admin_reviews_text()}</label>
      <textarea id="text" name="text" rows="4"
        class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm resize-y focus:outline-none focus:border-accent"
      >{form?.values?.text ?? row.text}</textarea>
      {#if form?.errors?.text}
        <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
      {/if}
    </div>

    <div>
      <label for="locale" class="block text-sm font-medium mb-1">{admin_reviews_locale()}</label>
      <select id="locale" name="locale"
        class="px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent">
        <option value="ru" selected={(form?.values?.locale ?? row.locale) === 'ru'}>RU — Русский</option>
        <option value="et" selected={(form?.values?.locale ?? row.locale) === 'et'}>ET — Eesti</option>
      </select>
    </div>

    <div>
      <label for="author" class="block text-sm font-medium mb-1">{admin_reviews_author()}</label>
      <input id="author" name="author" type="text" value={form?.values?.author ?? row.author}
        class="w-full px-3 py-2 rounded-input border border-border bg-bg text-sm focus:outline-none focus:border-accent" />
      {#if form?.errors?.author}
        <p role="alert" class="text-danger text-xs mt-1">{admin_error_required()}</p>
      {/if}
    </div>

    <button type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
      {admin_action_save()}
    </button>
  </form>
</div>
