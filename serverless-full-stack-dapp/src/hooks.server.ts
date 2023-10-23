import { appLogger } from '$lib/helpers/logger';
import { authController } from '$lib/server/auth/controller';
import type { Handle } from '@sveltejs/kit';
import { Config } from 'sst/node/config';

export const handle: Handle = async ({ event, resolve }) => {
  const { dAppDefinitionAddress, networkId } = Config;
  event.locals.dAppDefinitionAddress = dAppDefinitionAddress;
  event.locals.networkId = parseInt(networkId);

  appLogger.trace(`${event.request.method} ${event.route.id}`);

  if (event.route.id?.includes('(protected)')) {
    const result = authController
      .renewAuthToken(event.cookies)
      .andThen(authController.verifyAuthToken);

    if (result.isErr()) {
      appLogger.error(result.error);
      return new Response(JSON.stringify({ error: result.error }), {
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 401
      });
    }

    event.locals.identityAddress = result.value;

    return await resolve(event);
  }

  const response = await resolve(event, {});

  return response;
};
