import { writable } from 'svelte/store';

export const headings = writable<string[]>([]);

export const editMode = writable<boolean>(false);
