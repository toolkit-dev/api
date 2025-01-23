/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// toolkit
import { HttpError } from "@toolkit-dev/openapi-core/http-error";

/* -----------------------------------------------------------------------------
 * constants
 * -------------------------------------------------------------------------- */

export const DEFAULT_RETRY_COUNT = 3;

/* -----------------------------------------------------------------------------
 * httpErrorRetry
 * -------------------------------------------------------------------------- */

export type HttpErrorRetryOptions = {
  retryCount?: number;
  retryDelay?: number;
};

/**
 * Returns a function that can be used to determine if a request should be
 * retried based on the number of failures and the error.
 */
export function httpErrorRetry(options: HttpErrorRetryOptions) {
  return function (failureCount: number, error: unknown): boolean {
    const retryCount = options.retryCount ?? DEFAULT_RETRY_COUNT;

    if (failureCount >= retryCount) {
      return false;
    }

    // Only retry if the error is a 5XX error.
    // Is there something I could do for 429s specifically?
    return error instanceof HttpError && error.response.status >= 500;
  };
}
