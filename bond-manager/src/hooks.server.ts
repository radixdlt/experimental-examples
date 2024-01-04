import type { Handle } from '@sveltejs/kit';
import { Config } from 'sst/node/config';

export const handle: Handle = async ({ event, resolve }) => {
  const { dAppDefinitionAddress, networkId } = Config;
  event.locals.dAppDefinitionAddress = dAppDefinitionAddress;
  event.locals.networkId = parseInt(networkId);

  const json = {
    dApps: [
      {
        dAppDefinitionAddress: Config.dAppDefinitionAddress
      }
    ]
  };

  if (event.url.pathname.endsWith('/.well-known/radix.json')) {
    return new Response(JSON.stringify(json), {
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const response = await resolve(event);

  response.headers.set('Cache-Control', 'no-cache');

  return response;
};
