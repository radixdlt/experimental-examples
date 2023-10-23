import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { authController } from '$lib/server/auth/controller';
import { appLogger } from '$lib/helpers/logger';

/** @type {import('./$types').RequestHandler} */
export const GET: RequestHandler = async () => {
  const result = await authController.createChallenge();

  if (result.isErr()) {
    appLogger.error(result.error);
    throw error(result.error.httpResponseCode, result.error.reason);
  }

  return json(result.value.data, { status: result.value.httpResponseCode });
};
