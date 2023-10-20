import { ResultAsync } from 'neverthrow';
import { createApiError, type ApiError } from '../_types';
import type { DbClient, TodoItem } from '$lib/db/type';
import type { User } from '$lib/db/type';
import { TodoModel } from '../todo/model';

export type UserModel = ReturnType<typeof UserModel>;
export const UserModel = (dbClient: DbClient<User, 'identityAddress'>) => {
  const todoModel = TodoModel();

  const create = (identityAddress: string) =>
    ResultAsync.fromPromise<User, ApiError>(
      dbClient.upsert({ identityAddress, todoItems: [] }),
      createApiError('Failed to create user', 400)
    );

  const update = (value: User) =>
    ResultAsync.fromPromise<User, ApiError>(
      dbClient.upsert(value),
      createApiError('Failed to update user', 400)
    );

  const getById = (identityAddress: string) =>
    ResultAsync.fromPromise<User, ApiError>(
      dbClient.getById(identityAddress),
      createApiError('User not found', 404)
    );

  const getOrCreatePromise = async (identityAddress: string) => {
    const result = await getById(identityAddress);

    if (result.isErr()) {
      const userResult = await create(identityAddress);
      if (userResult.isErr()) throw userResult.error;
      return userResult.value;
    }

    return result.value;
  };

  const getOrCreate = (identityAddress: string) =>
    ResultAsync.fromPromise(
      getOrCreatePromise(identityAddress),
      createApiError('Could not create user', 400)
    );

  const createTodoItem = (identityAddress: string, text: string): ResultAsync<User, ApiError> =>
    getById(identityAddress)
      .map((user) => ({
        ...user,
        todoItems: [...user.todoItems, todoModel.create(text)]
      }))
      .andThen(update);

  const updateTodoItem = (
    identityAddress: string,
    todoItem: TodoItem
  ): ResultAsync<User, ApiError> =>
    getById(identityAddress)
      .map((user) => ({
        ...user,
        todoItems: todoModel.update(todoItem, user)
      }))
      .andThen(update);

  const removeTodoItem = (identityAddress: string, id: string): ResultAsync<User, ApiError> =>
    getById(identityAddress)
      .map((user) => ({
        ...user,
        todoItems: todoModel.remove(id, user)
      }))
      .andThen(update);

  return {
    create: getOrCreate,
    getById,
    update,
    todo: { create: createTodoItem, update: updateTodoItem, remove: removeTodoItem }
  };
};
