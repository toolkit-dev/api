/* -----------------------------------------------------------------------------
 * HttpError
 * -------------------------------------------------------------------------- */

/**
 * An error that occurs when a request fails.
 */
export class HttpError extends Error {
  /**
   * The response that caused the error.
   */
  response: Response;

  constructor(response: Response) {
    super(`Request failed with status ${response.status}`);
    this.response = response;
  }
}
