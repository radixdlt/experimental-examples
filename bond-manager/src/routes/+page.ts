import { goto } from '$app/navigation';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = () => {
  goto('/send-bond');
};
