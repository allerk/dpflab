<script lang="ts">
  import {
    admin_action_cancel,
    admin_action_delete,
    admin_confirm_delete
  } from '$lib/paraglide/messages';

  export let open = false;
  export let form: HTMLFormElement | null = null;
  export let onclose: () => void;
  export let onconfirm: () => void;

  function confirmDelete() {
    onconfirm();
    form?.requestSubmit();
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirmation-title"
      class="w-full max-w-sm rounded-card border border-border bg-bg-card p-5 shadow-xl"
    >
      <h2 id="delete-confirmation-title" class="text-lg font-semibold">{admin_confirm_delete()}</h2>
      <div class="mt-5 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-btn bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          on:click={onclose}
        >
          {admin_action_cancel()}
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-btn border border-danger text-danger text-sm font-medium hover:bg-danger/10 transition-colors cursor-pointer"
          on:click={confirmDelete}
        >
          {admin_action_delete()}
        </button>
      </div>
    </div>
  </div>
{/if}
