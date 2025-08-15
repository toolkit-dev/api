/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party

/* -----------------------------------------------------------------------------
 * std-error
 * -------------------------------------------------------------------------- */

// "name": "AxiosError",
// "message": "Request failed with status code 404",
// "status": 404,
// "title": "HTTP Request Error",
// "detail": "Request failed with status code 404",
// "payload": { "url": "https://api.example.com/data", "method": "GET" },
// "context": { "axios": true },
// "stack": "Error: Request failed with status code 404\n    at..."

// status?: number;
// payload?: Record<string, any>;

/**
 *
 */
export interface StdErrorOptions {
  message: string;
  title?: string;
  detail?: string;
  context?: Record<string, any>;
  cause?: unknown;
}

/**
 *
 */
export interface StdErrorData {
  title?: string;
  detail?: string;
  context?: Record<string, any>;
}

/**
 *
 */
export class StdError extends Error {
  constructor(message: string, code: string, cause?: Error) {
    super(message, { cause });
  }
}
