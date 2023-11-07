import type { TodoItem } from '$lib/db/type';
import type { User } from '$lib/db/type';
import { randomUUID } from 'node:crypto';

export type TodoModel = ReturnType<typeof TodoModel>;
export const TodoModel = () => {
  const create = (text: string): TodoItem => ({
    id: randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    text,
    isDone: false
  });

  const update = (value: TodoItem, user: User) =>
    user.todoItems.map((item) =>
      item.id === value.id ? { ...value, updatedAt: Date.now() } : item
    );

  const remove = (id: string, user: User) =>
    user.todoItems.filter((item) => (item.id === id ? false : true));

  return { create, remove, update };
};
