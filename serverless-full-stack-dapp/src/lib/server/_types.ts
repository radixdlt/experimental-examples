/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultAsync } from 'neverthrow';

export type ControllerOutput<T = any> = ResultAsync<
  { data: T; httpResponseCode: number },
  ApiError
>;

export type ApiError = ReturnType<ReturnType<typeof createApiError>>;
export const createApiError =
  (reason: string, httpResponseCode: number) =>
  (jsError?: any): { jsError?: Error; httpResponseCode: number; reason: string } => ({
    jsError,
    httpResponseCode,
    reason
  });
