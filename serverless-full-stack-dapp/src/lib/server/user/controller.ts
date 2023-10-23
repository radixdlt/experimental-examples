import type { User } from '$lib/db/type';
import { UserModel } from './model';
import { err, type ResultAsync } from 'neverthrow';
import { createApiError, type ApiError } from '../_types';
import { userTable } from '$lib/db/dynamodb/tables';

const UserController = ({ userModel }: { userModel: UserModel }) => {
  const getUser = (identityAddress: string): ResultAsync<User, ApiError> =>
    userModel.getById(identityAddress);

  const createTodo = (identityAddress: string, text: string) =>
    userModel.todo.create(identityAddress, text);

  const markAsCompleted = (identityAddress: string, id: string) => {
    return getUser(identityAddress).andThen((user) => {
      const todoItem = user.todoItems.find((item) => item.id === id);

      if (!todoItem) {
        return err(createApiError('Todo item not found', 404)());
      }

      return userModel.todo.update(identityAddress, { ...todoItem, isDone: !todoItem.isDone });
    });
  };

  const clearCompleted = (identityAddress: string) => {
    return getUser(identityAddress).andThen((user) => {
      const todoItems = user.todoItems.filter((item) => !item.isDone);

      return userModel.update({ ...user, todoItems });
    });
  };

  return { getUser, createTodo, markAsCompleted, clearCompleted };
};

export const userController = UserController({
  userModel: UserModel(userTable)
});
