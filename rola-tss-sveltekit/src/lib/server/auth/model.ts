import { ResultAsync } from 'neverthrow';
import { secureRandom } from './helpers/secure-random';

import { createApiError, type ApiError } from '../_types';
import type { Challenge, DbClient } from '$lib/db/type';

export type AuthModel = ReturnType<typeof AuthModel>;

export const AuthModel = (dbClient: DbClient<Challenge, 'challenge'>) => {
  const createChallenge = (): ResultAsync<string, ApiError> => {
    const challenge = secureRandom(32);

    return ResultAsync.fromPromise(
      dbClient.upsert({
        challenge,
        expiresAt: Math.floor((Date.now() + 1000 * 60) / 1000),
        createdAt: Date.now()
      }),
      createApiError('createChallengeFailed', 500)
    ).map(({ challenge }) => challenge);
  };

  const getAndDelete = (challenge: string) => {
    const result = ResultAsync.fromPromise(
      dbClient.getAndDelete(challenge),
      createApiError('challengeNotFound', 404)
    );

    return result;
  };

  return { createChallenge, getAndDelete, dbClient };
};
