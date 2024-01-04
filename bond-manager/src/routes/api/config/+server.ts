import { json, type RequestHandler } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET: RequestHandler = async ({ locals }) => {
  return json(
    { dAppDefinitionAddress: locals.dAppDefinitionAddress, networkId: locals.networkId },
    { status: 200 }
  );
};
