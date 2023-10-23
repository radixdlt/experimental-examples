import { writable } from 'svelte/store';
import type { User } from '$lib/db/type';

export const userStore = writable<undefined | User>(undefined);
