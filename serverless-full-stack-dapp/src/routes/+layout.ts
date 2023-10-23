import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => fetch('/api/config').then((r) => r.json());
