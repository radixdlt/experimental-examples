import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { createApiError, type ApiError } from '../../_types';
import type { Challenge } from '$lib/db/type';

export const hasChallengeExpired = (challenge: Challenge): ResultAsync<Challenge, ApiError> => {
  const { createdAt } = challenge;
  const expiresAt = createdAt + 300_000; // 5 minutes
  const hasExpired = Date.now() > expiresAt;

  return hasExpired ? errAsync(createApiError('challengeExpired', 400)()) : okAsync(challenge);
};
