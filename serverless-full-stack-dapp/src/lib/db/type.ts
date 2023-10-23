export type Challenge = {
  challenge: string;
  createdAt: number;
  expiresAt: number;
};

export type TodoItem = {
  id: string;
  createdAt: number;
  updatedAt: number;
  text: string;
  isDone: boolean;
};

export type User = {
  identityAddress: string;
  todoItems: TodoItem[];
};

export type DbClient<T extends object, PK extends keyof T> = {
  upsert: (item: T) => Promise<T>;
  getById: (id: T[PK]) => Promise<T>;
  getAndDelete: (id: T[PK]) => Promise<T | undefined>;
  list: (id: T[PK], sortId: T[PK]) => Promise<T[] | []>;
};
