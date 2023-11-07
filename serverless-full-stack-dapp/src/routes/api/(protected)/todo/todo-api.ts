import type { User } from '$lib/db/type';
import { fetchWrapper } from '$lib/helpers/fetch-wrapper';

const create = (text: string) =>
  fetchWrapper<User>(
    fetch('/api/todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
  ).map(({ data }) => data);

const markAsCompleted = (id: string) =>
  fetchWrapper<User>(
    fetch(`/api/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  ).map(({ data }) => data);

const clearCompleted = () =>
  fetchWrapper<User>(
    fetch(`/api/todo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  ).map(({ data }) => data);

export const todoApi = { create, markAsCompleted, clearCompleted } as const;
