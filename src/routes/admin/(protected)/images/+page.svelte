<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    admin_images_title,
    admin_images_upload,
    admin_images_choose_file,
    admin_images_no_files,
    admin_images_copy_url,
    admin_action_delete,
    admin_confirm_delete
  } from '$lib/paraglide/messages';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: files = (form as { files?: string[] } | null)?.files ?? data.files;

  let copied = '';
  function copyUrl(filename: string) {
    navigator.clipboard.writeText(`/images/${filename}`);
    copied = filename;
    setTimeout(() => (copied = ''), 1500);
  }
</script>

<div class="max-w-3xl">
  <h1 class="text-2xl font-bold mb-6">{admin_images_title()}</h1>

  <form
    method="POST"
    action="?/upload"
    enctype="multipart/form-data"
    class="bg-bg-card rounded-card p-5 border border-border mb-8 flex items-end gap-3 flex-wrap"
    use:enhance
  >
    <div class="flex-1 min-w-48">
      <label for="upload-file" class="block text-sm mb-1">{admin_images_choose_file()}</label>
      <input
        id="upload-file"
        type="file"
        name="file"
        accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.avif"
        required
        class="block w-full text-sm text-fg-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-btn file:border file:border-border file:text-sm file:bg-bg file:text-fg file:cursor-pointer hover:file:bg-bg-card"
      />
    </div>
    <button
      type="submit"
      class="px-4 py-2 rounded-btn bg-accent text-bg font-semibold text-sm cursor-pointer shrink-0"
    >
      {admin_images_upload()}
    </button>
  </form>

  {#if files.length === 0}
    <p class="text-fg-muted text-sm">{admin_images_no_files()}</p>
  {:else}
    <div class="border border-border rounded-card overflow-hidden">
      {#each files as filename, i}
        <div
          class="flex items-center gap-3 px-4 py-3 bg-bg-card {i < files.length - 1
            ? 'border-b border-border'
            : ''}"
        >
          <img
            src="/images/{filename}"
            alt={filename}
            class="w-12 h-12 object-cover rounded shrink-0 bg-bg"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-mono truncate">{filename}</p>
            <p class="text-xs text-fg-muted font-mono truncate">/images/{filename}</p>
          </div>
          <button
            type="button"
            on:click={() => copyUrl(filename)}
            class="text-sm px-3 py-1.5 rounded-btn border border-border hover:bg-bg transition-colors cursor-pointer shrink-0 {copied === filename
              ? 'text-accent border-accent'
              : ''}"
          >
            {copied === filename ? '✓' : admin_images_copy_url()}
          </button>
          <form
            method="POST"
            action="?/delete"
            use:enhance
            on:submit|preventDefault={(e) => {
              if (confirm(admin_confirm_delete())) (e.target as HTMLFormElement).submit();
            }}
          >
            <input type="hidden" name="filename" value={filename} />
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
</div>
