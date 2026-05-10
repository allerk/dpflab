import { writable } from 'svelte/store';
import type { Locale } from './types';

export const lang = writable<Locale>('ru');
