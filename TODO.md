# TODO

## Persist language selection
The `lang` store in `src/lib/stores.ts` is in-memory only — switching to EE and
refreshing the page resets it to RU.

Fix: read/write the chosen locale to `localStorage` in the store so the
selection survives page reloads.

```ts
// src/lib/stores.ts
import { writable } from 'svelte/store';
import type { Locale } from './types';

const stored = (typeof localStorage !== 'undefined'
  ? localStorage.getItem('lang')
  : null) as Locale | null;

export const lang = writable<Locale>(stored ?? 'ru');

lang.subscribe((value) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem('lang', value);
});
```
