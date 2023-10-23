import type { User } from '$lib/db/type';
import { fetchWrapper } from '$lib/helpers/fetch-wrapper';

const me = () => fetchWrapper<User>(fetch('/api/user')).map(({ data }) => data);

export const userApi = {
  me
} as const;
