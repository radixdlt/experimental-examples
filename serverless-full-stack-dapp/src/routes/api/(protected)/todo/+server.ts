import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { userController } from '$lib/server/user/controller';

/** @type {import('./$types').RequestHandler} */
export const POST: RequestHandler = async ({ request, locals }) => {
  const { text }: { text: string } = await request.json();
  const { identityAddress } = locals;

  const result = await userController.createTodo(identityAddress, text);

  if (result.isErr()) {
    throw error(result.error.httpResponseCode, result.error.reason);
  }

  return json(result.value, { status: 200 });
};

/** @type {import('./$types').RequestHandler} */
export const DELETE: RequestHandler = async ({ locals }) => {
  const { identityAddress } = locals;

  const result = await userController.clearCompleted(identityAddress);

  if (result.isErr()) {
    throw error(result.error.httpResponseCode, result.error.reason);
  }

  return json(result.value, { status: 200 });
};
