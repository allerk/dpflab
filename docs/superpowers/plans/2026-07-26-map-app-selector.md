# Map App Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the workshop address open an explicit, accessible choice of Google Maps, Waze, Apple Maps, or clipboard copy.

**Architecture:** Keep the database address as a string. Put provider URL and clipboard behavior in a small framework-independent TypeScript module, render the interaction in a focused Svelte component, and replace only the current plain address node in `ContactForm.svelte`.

**Tech Stack:** Svelte 5, SvelteKit 2, TypeScript, Paraglide JS 2, Tailwind CSS 4, Vitest 4.

## Global Constraints

- The site must never choose a map provider automatically.
- Action order is exactly Google Maps, Waze, Apple Maps, Copy address.
- Provider links receive only the destination; do not force a transport mode.
- Keep `contacts.address` as the existing required string; no database or admin changes.
- Use HTTPS provider links with web fallbacks; do not use app-only URL schemes.
- Add no dependencies and do not modify `package.json` or `package-lock.json`.
- Support Russian, Estonian, and English.
- Work only on `feat/map-app-selector`; do not merge into `develop`.

---

## File Structure

- Create `src/lib/map-app-selector.ts`: provider ordering, URL construction, and injectable clipboard operation.
- Create `tests/map-app-selector.test.ts`: unit coverage for order, encoding, and clipboard outcomes.
- Create `src/lib/components/MapAppSelector.svelte`: menu state, accessibility, outside-click/Escape dismissal, and feedback.
- Modify `src/lib/components/ContactForm.svelte`: render the selector beside the existing map icon.
- Modify `messages/ru.json`, `messages/et.json`, `messages/en.json`: localized labels and feedback.

### Task 1: Provider and Clipboard Logic

**Files:**
- Create: `tests/map-app-selector.test.ts`
- Create: `src/lib/map-app-selector.ts`

**Interfaces:**
- Produces: `MapProvider`, `MapAction`, `CopyResult`
- Produces: `MapMenuState`, `MapMenuAction`
- Produces: `buildMapActions(address: string): MapAction[]`
- Produces: `copyMapAddress(address: string, writeText: (value: string) => Promise<void>): Promise<CopyResult>`
- Produces: `createMapMenuState(): MapMenuState`
- Produces: `reduceMapMenuState(state: MapMenuState, action: MapMenuAction): MapMenuState`

- [ ] **Step 1: Write the failing unit tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  buildMapActions,
  copyMapAddress,
  createMapMenuState,
  reduceMapMenuState
} from '../src/lib/map-app-selector';

describe('buildMapActions', () => {
  it('returns providers in the required order with encoded destinations', () => {
    const actions = buildMapActions('Saha-Loo tee 36, Iru, 74206');

    expect(actions.map((action) => action.provider)).toEqual(['google', 'waze', 'apple']);
    expect(actions[0].href).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Saha-Loo+tee+36%2C+Iru%2C+74206'
    );
    expect(actions[1].href).toBe(
      'https://waze.com/ul?q=Saha-Loo+tee+36%2C+Iru%2C+74206&navigate=yes'
    );
    expect(actions[2].href).toBe(
      'https://maps.apple.com/?daddr=Saha-Loo+tee+36%2C+Iru%2C+74206'
    );
  });
});

describe('copyMapAddress', () => {
  it('returns success after writing the unchanged address', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyMapAddress('Saha-Loo tee 36', writeText)).resolves.toBe('success');
    expect(writeText).toHaveBeenCalledWith('Saha-Loo tee 36');
  });

  it('returns error when clipboard access fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    await expect(copyMapAddress('Saha-Loo tee 36', writeText)).resolves.toBe('error');
  });
});

describe('reduceMapMenuState', () => {
  it('toggles the menu and dismisses it for outside-click or Escape handlers', () => {
    const opened = reduceMapMenuState(createMapMenuState(), { type: 'toggle' });
    expect(opened).toEqual({ open: true, feedback: null });
    expect(reduceMapMenuState(opened, { type: 'dismiss' })).toEqual({
      open: false,
      feedback: null
    });
  });

  it.each(['success', 'error'] as const)('closes with %s clipboard feedback', (result) => {
    const opened = reduceMapMenuState(createMapMenuState(), { type: 'toggle' });
    expect(reduceMapMenuState(opened, { type: 'copied', result })).toEqual({
      open: false,
      feedback: result
    });
  });

  it('clears transient clipboard feedback', () => {
    expect(
      reduceMapMenuState(
        { open: false, feedback: 'success' },
        { type: 'clear-feedback' }
      )
    ).toEqual({ open: false, feedback: null });
  });
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- tests/map-app-selector.test.ts`

Expected: FAIL because `src/lib/map-app-selector.ts` does not exist.

- [ ] **Step 3: Implement the minimal framework-independent logic**

```ts
export type MapProvider = 'google' | 'waze' | 'apple';
export type CopyResult = 'success' | 'error';

export type MapAction = {
  provider: MapProvider;
  href: string;
};

export type MapMenuState = {
  open: boolean;
  feedback: CopyResult | null;
};

export type MapMenuAction =
  | { type: 'toggle' }
  | { type: 'dismiss' }
  | { type: 'copied'; result: CopyResult }
  | { type: 'clear-feedback' };

export function createMapMenuState(): MapMenuState {
  return { open: false, feedback: null };
}

export function reduceMapMenuState(
  state: MapMenuState,
  action: MapMenuAction
): MapMenuState {
  switch (action.type) {
    case 'toggle':
      return { ...state, open: !state.open };
    case 'dismiss':
      return { ...state, open: false };
    case 'copied':
      return { open: false, feedback: action.result };
    case 'clear-feedback':
      return { ...state, feedback: null };
  }
}

export function buildMapActions(address: string): MapAction[] {
  const google = new URL('https://www.google.com/maps/dir/');
  google.searchParams.set('api', '1');
  google.searchParams.set('destination', address);

  const waze = new URL('https://waze.com/ul');
  waze.searchParams.set('q', address);
  waze.searchParams.set('navigate', 'yes');

  const apple = new URL('https://maps.apple.com/');
  apple.searchParams.set('daddr', address);

  return [
    { provider: 'google', href: google.toString() },
    { provider: 'waze', href: waze.toString() },
    { provider: 'apple', href: apple.toString() }
  ];
}

export async function copyMapAddress(
  address: string,
  writeText: (value: string) => Promise<void>
): Promise<CopyResult> {
  try {
    await writeText(address);
    return 'success';
  } catch {
    return 'error';
  }
}
```

- [ ] **Step 4: Run the focused test and verify success**

Run: `npm test -- tests/map-app-selector.test.ts`

Expected: PASS with 7 tests.

- [ ] **Step 5: Commit the tested logic**

```bash
git add src/lib/map-app-selector.ts tests/map-app-selector.test.ts
git commit -m "test: add map selector link logic"
```

### Task 2: Accessible Selector Component and Translations

**Files:**
- Create: `src/lib/components/MapAppSelector.svelte`
- Modify: `messages/ru.json`
- Modify: `messages/et.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `buildMapActions(address)` and `copyMapAddress(address, writeText)`
- Consumes: `address: string` component prop
- Produces: accessible address trigger and provider action menu

- [ ] **Step 1: Add complete translations in all locales**

Add the following keys after `contacts_address`:

```json
// messages/ru.json
"map_selector_open": "Выбрать приложение для маршрута к {address}",
"map_selector_google": "Google Maps",
"map_selector_waze": "Waze",
"map_selector_apple": "Apple Maps",
"map_selector_copy": "Скопировать адрес",
"map_selector_copy_success": "Адрес скопирован",
"map_selector_copy_error": "Не удалось скопировать адрес"
```

```json
// messages/et.json
"map_selector_open": "Vali rakendus teekonna jaoks aadressile {address}",
"map_selector_google": "Google Maps",
"map_selector_waze": "Waze",
"map_selector_apple": "Apple Maps",
"map_selector_copy": "Kopeeri aadress",
"map_selector_copy_success": "Aadress on kopeeritud",
"map_selector_copy_error": "Aadressi kopeerimine ebaõnnestus"
```

```json
// messages/en.json
"map_selector_open": "Choose an app for directions to {address}",
"map_selector_google": "Google Maps",
"map_selector_waze": "Waze",
"map_selector_apple": "Apple Maps",
"map_selector_copy": "Copy address",
"map_selector_copy_success": "Address copied",
"map_selector_copy_error": "Could not copy address"
```

- [ ] **Step 2: Run generation/type checking before the component exists**

Run: `npm run check`

Expected: PASS and generate typed Paraglide message functions for the new keys.

- [ ] **Step 3: Create the selector component**

Implement `MapAppSelector.svelte` with:

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    map_selector_apple,
    map_selector_copy,
    map_selector_copy_error,
    map_selector_copy_success,
    map_selector_google,
    map_selector_open,
    map_selector_waze
  } from '$lib/paraglide/messages';
  import {
    buildMapActions,
    copyMapAddress,
    createMapMenuState,
    reduceMapMenuState,
    type MapProvider
  } from '$lib/map-app-selector';

  export let address: string;

  const labels: Record<MapProvider, () => string> = {
    google: map_selector_google,
    waze: map_selector_waze,
    apple: map_selector_apple
  };

  let state = createMapMenuState();
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
  $: actions = buildMapActions(address);

  function dispatch(action: Parameters<typeof reduceMapMenuState>[1]) {
    state = reduceMapMenuState(state, action);
  }

  function close(returnFocus = false) {
    dispatch({ type: 'dismiss' });
    if (returnFocus) void tick().then(() => trigger?.focus());
  }

  async function copyAddress() {
    const result = await copyMapAddress(address, (value) => navigator.clipboard.writeText(value));
    dispatch({ type: 'copied', result });
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => dispatch({ type: 'clear-feedback' }), 2500);
  }

  onMount(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (state.open && root && !root.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (state.open && event.key === 'Escape') close(true);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(feedbackTimer);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>
```

Render:

- a `relative` root bound to `root`;
- a real button bound to `trigger`, dispatching `{ type: 'toggle' }`, with `aria-haspopup="menu"`, `aria-expanded={state.open}`, `aria-controls="map-app-menu"`, and `aria-label={map_selector_open({ address })}`;
- the address text as the visible button label;
- an absolute `role="menu"` list when `open`;
- three links generated from `actions`, each with `target="_blank"` and `rel="noreferrer"`, followed by the copy button;
- a visually small `aria-live="polite"` feedback line derived from `state.feedback`;
- existing design tokens (`bg-bg-elev`, `border-border`, `text-fg`, `text-fg-muted`, `text-accent`) and visible `focus-visible` rings;
- minimum 44px vertical touch targets for every action.

- [ ] **Step 4: Run static validation**

Run: `npm run check`

Expected: PASS with no Svelte accessibility or TypeScript errors.

- [ ] **Step 5: Commit the component and translations**

```bash
git add src/lib/components/MapAppSelector.svelte messages/ru.json messages/et.json messages/en.json
git commit -m "feat: add accessible map app selector"
```

### Task 3: Contact Card Integration and Verification

**Files:**
- Modify: `src/lib/components/ContactForm.svelte`

**Interfaces:**
- Consumes: `MapAppSelector` with `address: string`
- Produces: existing contact card with the selector in the current address row

- [ ] **Step 1: Import and render the component**

Add:

```ts
import MapAppSelector from '$lib/components/MapAppSelector.svelte';
```

Replace:

```svelte
<Icon name="map" size={17}/><span>{contactsRow.address}</span>
```

with:

```svelte
<span class="mt-0.5 shrink-0 text-accent"><Icon name="map" size={17}/></span>
<MapAppSelector address={contactsRow.address} />
```

- [ ] **Step 2: Run the complete automated verification**

Run:

```bash
npm run check
npm test
npm run build
```

Expected: all commands exit 0; the test suite includes the 7 new map-selector tests.

- [ ] **Step 3: Verify interactions in the browser**

Start the local site with `npm run dev`, then verify at the contact card in Russian, Estonian, and English:

1. Address click opens the menu.
2. Order is Google Maps, Waze, Apple Maps, Copy address.
3. Provider links contain the encoded current database address.
4. Copy closes the menu and announces success.
5. Outside click closes the menu.
6. Escape closes the menu and returns focus to the address trigger.
7. Keyboard navigation reaches every action with visible focus.
8. The menu remains within the viewport at mobile width.

- [ ] **Step 4: Commit the integration**

```bash
git add src/lib/components/ContactForm.svelte
git commit -m "feat: link contact address to map choices"
```

- [ ] **Step 5: Review the final branch without merging**

Run:

```bash
git status --short --branch
git log --oneline origin/develop..HEAD
git diff --check origin/develop...HEAD
```

Expected: feature commits are present on `feat/map-app-selector`; no merge into `develop` is performed.
