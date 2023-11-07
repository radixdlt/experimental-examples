import { appLogger, type AppLogger } from '$lib/helpers/logger';
import type { ControllerOutput } from '../_types';

import { hasChallengeExpired } from './helpers/has-challenge-expired';
import { Rola } from '@radixdlt/rola';
import { SignedChallenge } from '@radixdlt/radix-dapp-toolkit';

import { err, errAsync, ok } from 'neverthrow';
import { OAuth2 } from './oauth2';
import { AuthModel } from './model';
import { UserModel } from '../user/model';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { challengeTable, userTable } from '$lib/db/dynamodb/tables';

const {
  NODE_ENV,
  SST_Parameter_value_origin,
  SST_Parameter_value_dAppDefinitionAddress,
  SST_Parameter_value_networkId
} = env;

const expectedOrigin =
  NODE_ENV === 'development' ? 'http://localhost:5173' : SST_Parameter_value_origin || '';

export type AuthController = ReturnType<typeof AuthController>;
export const AuthController = ({
  authModel,
  userModel,
  oAuth2,
  logger,
  expectedOrigin,
  dAppDefinitionAddress,
  networkId
}: {
  authModel: AuthModel;
  userModel: UserModel;
  expectedOrigin: string;
  dAppDefinitionAddress: string;
  networkId: number;
  oAuth2: OAuth2;
  logger: AppLogger;
}) => {
  const { verifySignedChallenge } = Rola({
    applicationName: '',
    expectedOrigin,
    dAppDefinitionAddress,
    networkId
  });

  const createChallenge = (): ControllerOutput<{ challenge: string }> =>
    authModel
      .createChallenge()
      .map((challenge) => ({ data: { challenge }, httpResponseCode: 201 }));

  const login = (
    signedChallenge: SignedChallenge,
    cookies: Cookies
  ): ControllerOutput<{
    authToken: string;
    headers: { ['Set-Cookie']: string };
  }> => {
    logger?.debug('Verifying signed challenge', signedChallenge);

    if (!SignedChallenge.safeParse(signedChallenge))
      return errAsync({
        httpResponseCode: 400,
        reason: 'invalidRequestBody'
      });

    return authModel
      .getAndDelete(signedChallenge.challenge)
      .andThen((challenge) =>
        challenge ? ok(challenge) : err({ reason: 'challengeNotFound', jsError: undefined })
      )
      .andThen(hasChallengeExpired)
      .andThen(() => verifySignedChallenge(signedChallenge))
      .mapErr(({ reason, jsError }) => ({
        httpResponseCode: 400,
        reason,
        jsError
      }))
      .andThen(() => userModel.create(signedChallenge.address))
      .andThen(() => oAuth2.createTokens(signedChallenge.address))
      .map(({ authToken, refreshToken }) => ({
        data: {
          authToken,
          headers: oAuth2.createRefreshTokenCookie(refreshToken, cookies)
        },
        httpResponseCode: 200
      }));
  };

  const renewAuthToken = (cookies: Cookies) => oAuth2.renewAuthToken(cookies);

  const verifyAuthHeader = (authorizationHeaderValue: string | null) => {
    const authToken = (authorizationHeaderValue || '').split(' ')[1];
    return authToken ? oAuth2.verifyToken(authToken) : err({ reason: 'invalidToken' });
  };

  const verifyAuthToken = (authToken?: string) =>
    authToken ? oAuth2.verifyToken(authToken) : err({ reason: 'invalidToken' });

  return {
    createChallenge,
    login,
    renewAuthToken,
    verifyAuthToken,
    verifyAuthHeader,
    options: { expectedOrigin, dAppDefinitionAddress, networkId }
  };
};

const options = {
  expectedOrigin,
  networkId: parseInt(SST_Parameter_value_networkId || '2'),
  dAppDefinitionAddress: SST_Parameter_value_dAppDefinitionAddress || ''
};

appLogger.debug(options, 'authControllerOptions');

export const authController = AuthController({
  ...options,
  logger: appLogger,
  oAuth2: OAuth2(),
  userModel: UserModel(userTable),
  authModel: AuthModel(challengeTable)
});
