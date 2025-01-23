/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { Endpoint, EndpointRequestParams } from "./endpoint.js";
import { ClientErrorStatusCode, ServerErrorStatusCode } from "./response.js";

/* -----------------------------------------------------------------------------
 * client
 * -------------------------------------------------------------------------- */

/**
 * A function that creates a payload for a given endpoint.
 */
export type PayloadCreator = <E extends Endpoint>(endpoint: E) => unknown;

/**
 * The payload creators for the client toolkit.
 */
export type PayloadCreators = {
  requestParams?: {
    [K in "cookie" | "header" | "path" | "query"]?: PayloadCreator;
  };
};

/**
 * The return type of a payload creator for the request params.
 */
export type GetPayloadCreatorRequestParamReturn<
  O extends { payloadCreators?: PayloadCreators },
  K extends keyof EndpointRequestParams,
> = O extends {
  payloadCreators: { requestParams: { [N in K]: PayloadCreator } };
}
  ? ReturnType<O["payloadCreators"]["requestParams"][K]>
  : never;

/**
 * Get the request params for an endpoint.
 */
export function getCreatedParams<E extends Endpoint>(
  endpoint: E,
  options: { payloadCreators?: PayloadCreators },
) {
  const requestParams = options.payloadCreators?.requestParams;
  const clientCookie = requestParams?.cookie?.(endpoint) || {};
  const clientHeader = requestParams?.header?.(endpoint) || {};
  const clientPath = requestParams?.path?.(endpoint) || {};
  const clientQuery = requestParams?.query?.(endpoint) || {};

  return {
    cookie: clientCookie,
    header: clientHeader,
    path: clientPath,
    query: clientQuery,
  };
}

/* -----------------------------------------------------------------------------
 * url
 * -------------------------------------------------------------------------- */

/**
 * The options for building a URL.
 */
export type BuildUrlOptions = {
  baseUrl: string;
  path: string;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
};

/**
 * Build the URL from the base URL, path, path parameters, and query parameters.
 */
export function buildUrl({
  baseUrl,
  path,
  pathParams,
  queryParams,
}: BuildUrlOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const urlString = `${normalizedBaseUrl}/${templatePath(normalizedPath, pathParams)}`;

  return appendQuery(urlString, queryParams);
}

/**
 * Template path parameters in the path.
 */
export function templatePath(
  path: string,
  pathParams: Record<string, string> | undefined = {},
) {
  return path.replace(/:(\w+)/g, (_, key) => {
    if (!(key in pathParams)) {
      throw new Error(`Missing path parameter: ${key}`);
    }

    return encodeURIComponent(pathParams[key]);
  });
}

/**
 * Append query parameters to a URL string.
 */
export function appendQuery(urlString: string, query?: Record<string, string>) {
  const url = new URL(urlString);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  return url.toString();
}

/* -----------------------------------------------------------------------------
 * headers
 * -------------------------------------------------------------------------- */

/**
 * Normalize headers.
 */
export function normalizeHeaders(headers: Record<string, string>) {
  return Object.entries(headers).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

/* -----------------------------------------------------------------------------
 * cookies
 * -------------------------------------------------------------------------- */

/**
 * Create a cookie value from an object.
 */
export function createCookieValue(cookies: Record<string, string>) {
  return Object.entries(cookies)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("; ");
}

/**
 * Append a cookie value to a current cookie value.
 */
export function appendCookie(cookieValue: string, currentCookieValue?: string) {
  return currentCookieValue
    ? `${currentCookieValue}; ${cookieValue}`
    : cookieValue;
}

/* -----------------------------------------------------------------------------
 * response
 * -------------------------------------------------------------------------- */

export function isErrorResponse<T extends { status: number }>(
  response: T,
): response is Extract<
  T,
  { status: ClientErrorStatusCode | ServerErrorStatusCode }
> {
  return response.status >= 400;
}
