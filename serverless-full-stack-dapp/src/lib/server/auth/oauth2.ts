import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Result, err, ok } from 'neverthrow';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const { NODE_ENV, SST_Secret_value_jwtSecret } = env;

export type OAuth2Input = {
  refreshToken: { expiresIn: string; key: string };
  authToken: { expiresIn: string };
  secret: string;
};

const JWT_SECRET = NODE_ENV === 'production' ? SST_Secret_value_jwtSecret : 'secret';

export type OAuth2 = ReturnType<typeof OAuth2>;
export const OAuth2 = (input?: Partial<OAuth2Input>) => {
  const { secret, refreshToken, authToken }: OAuth2Input = {
    secret: JWT_SECRET!,
    refreshToken: { expiresIn: '30d', key: 'jwt' },
    authToken: { expiresIn: '10m' },
    ...(input || {})
  };

  const createAuthToken = (identityAddress: string) =>
    ok(
      jwt.sign({ identityAddress }, secret, {
        expiresIn: authToken.expiresIn
      })
    );

  const createRefreshToken = (identityAddress: string) =>
    ok(
      jwt.sign({ identityAddress }, secret, {
        expiresIn: refreshToken.expiresIn
      })
    );

  const createTokens = (identityAddress: string) =>
    Result.combine([createAuthToken(identityAddress), createRefreshToken(identityAddress)]).map(
      ([authToken, refreshToken]) => ({ authToken, refreshToken })
    );

  const getRefreshTokenFromCookies = (
    cookies: Cookies
  ): Result<string, { reason: string; jsError?: Error }> => {
    const token = cookies.get('jwt');
    return token ? ok(token) : err({ reason: 'invalidRefreshToken' });
  };

  const verifyToken = (token: string): Result<string, { reason: string; jsError?: Error }> => {
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return ok(typeof decoded === 'string' ? decoded : decoded.identityAddress);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return err({ jsError: error, reason: 'invalidToken' });
    }
  };

  const createRefreshTokenCookie = (token: string, cookies: Cookies) => ({
    'Set-Cookie': cookies.serialize(refreshToken.key, token, createRefreshTokenOptions())
  });

  const rotateRefreshToken = (
    cookies: Cookies
  ): Result<{ ['Set-Cookie']: string }, { jsError?: Error; reason: string }> =>
    getRefreshTokenFromCookies(cookies)
      .andThen(verifyToken)
      .andThen(createRefreshToken)
      .map((jwt) => createRefreshTokenCookie(jwt, cookies));

  const renewAuthToken = (cookies: Cookies): Result<string, { jsError?: Error; reason: string }> =>
    getRefreshTokenFromCookies(cookies).andThen(verifyToken).andThen(createAuthToken);

  const createRefreshTokenOptions = (): Parameters<Cookies['serialize']>[2] => {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    return {
      httpOnly: true,
      expires: new Date(Date.now() + ONE_DAY),
      sameSite: 'lax',
      path: '/'
    };
  };

  return {
    createTokens,
    rotateRefreshToken,
    renewAuthToken,
    createRefreshTokenCookie,
    verifyToken
  };
};
