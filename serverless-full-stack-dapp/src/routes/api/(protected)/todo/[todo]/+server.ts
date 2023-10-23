import { appLogger } from '$lib/helpers/logger';
import { userController } from '$lib/server/user/controller';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const PUT: RequestHandler = async ({ params, locals }) => {
  const { identityAddress } = locals;
  const { todo: todoItemId } = params;
  appLogger.debug({ todoItemId });

  const result = await userController.markAsCompleted(identityAddress, todoItemId);

  if (result.isErr()) throw error(result.error.httpResponseCode, result.error.reason);

  return json(result.value, { status: 200 });
};
