/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { ComponentsObject } from "openapi3-ts/oas31";
import { IsNever, IsUnknown, ValueOf } from "type-fest";

// toolkit
import {
  appendCookie,
  buildUrl,
  createCookieValue,
  getCreatedParams,
  GetPayloadCreatorRequestParamReturn,
  normalizeHeaders,
  PayloadCreators,
} from "@toolkit-dev/openapi-core/client";
import {
  Endpoint,
  EndpointRequestParams,
  EndpointTree,
  GetRequestBodyInput,
  GetRequestParamInput,
  GetResponseContentOutput,
  GetResponseStatusCodes,
  isEndpoint,
} from "@toolkit-dev/openapi-core/endpoint";
import {
  getUnknown,
  omit,
  OptionalIfNoRequiredKeys,
  RequiredKeysOfLoose,
  SetOptionalLoose,
} from "@toolkit-dev/openapi-core/utils";
import {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
} from "@toolkit-dev/openapi-core/response";

// lib
import { HttpError } from "./http-error.js";

/* -----------------------------------------------------------------------------
 * client
 * -------------------------------------------------------------------------- */

/**
 * Options for creating a client toolkit.
 */
export type CreateClientToolkitOptions = {
  /**
   * The base URL of the API. This value will be prepended to the path of each
   * endpoint.
   */
  baseUrl: string;

  /**
   * Whether or not to throw an HttpError when status code returned is in the
   * 4xx or 5xx range.
   */
  throwHttpError?: {
    disabled?: boolean;
    errorClass?: typeof HttpError;
  };

  /**
   * Whether or not to cache the result of response.json().
   */
  cacheResponseJson?: {
    disabled?: boolean;
  };

  /**
   * Whether or not to cache the result of response.text().
   */
  cacheResponseText?: {
    disabled?: boolean;
  };

  /**
   * Adds custom payload creators for each request parameter type. These hooks
   * will run on each endpoint fetch invocation and the results will be set on
   * the corresponding param before merging in any params passed in as fetch
   * options.
   */
  payloadCreators?: PayloadCreators;

  /**
   * The security schemes defined in the document.
   */
  security?: {
    schemes: ComponentsObject["securitySchemes"];
  };
};

/**
 * Create a client toolkit.
 */
export function createClientToolkit<Options extends CreateClientToolkitOptions>(
  options: Options = {} as Options,
) {
  /**
   * Create a fetch function for a given endpoint.
   *
   * TODO:
   * - Build headers, params, etc from endpoint
   * - Make client calls
   */
  function createEndpointFetch<E extends Endpoint>(endpoint: E) {
    const fetchFn = async (requestInit: EndpointFetchOptions<E, Options>) => {
      // Note: This is workaround required because the EndpointFetchOptions
      // can't guarantee that the requestInit object will have any of the keys
      // defined. This was caused by the OptionalIfNoRequiredKeys utility
      // function which allows for keys to be optional if they are an object
      // with no required keys.
      const cookie = getUnknown(requestInit, "cookie");
      const headers = getUnknown(requestInit, "headers");
      const path = getUnknown(requestInit, "path");
      const query = getUnknown(requestInit, "query");
      const body = getUnknown(requestInit, "body");
      const reqInit = omit(requestInit, [
        "cookie",
        "headers",
        "path",
        "query",
        "body",
      ]);

      const clientParams = getCreatedParams(endpoint, options);
      const requestParams = {
        cookie: { ...clientParams.cookie, ...(cookie || {}) },
        header: { ...clientParams.header, ...(headers || {}) },
        path: { ...clientParams.path, ...(path || {}) },
        query: { ...clientParams.query, ...(query || {}) },
      };

      const url = buildUrl({
        baseUrl: options.baseUrl,
        path: endpoint.__internal__.path,
        pathParams: requestParams.path,
        queryParams: requestParams.query,
      });

      const reqHeaders = normalizeHeaders(requestParams.header);
      const cookieValue = createCookieValue(requestParams.cookie);
      if (cookieValue) {
        reqHeaders.cookie = appendCookie(reqHeaders.cookie, cookieValue);
      }

      // TODO: Could add additional serializers here? Could allow for
      // serializers to be passed in as options?
      const reqBody =
        body && reqHeaders["content-type"] === "application/json"
          ? JSON.stringify(body)
          : body;

      const result = await fetch(url, {
        ...reqInit,
        method: endpoint.__internal__.method,
        headers: reqHeaders,
        ...(reqBody ? { body: reqBody as any } : {}),
      });

      if (!options.cacheResponseJson?.disabled) {
        const originalJson = result.json.bind(result);
        let parsed = false;
        let parsedJson: any;

        result.json = async () => {
          if (!parsed) {
            parsedJson = await originalJson();
            parsed = true;
          }

          return parsedJson;
        };
      }

      if (!options.cacheResponseText?.disabled) {
        const originalText = result.text.bind(result);
        let parsed = false;
        let parsedText: string;

        result.text = async () => {
          if (!parsed) {
            parsedText = await originalText();
            parsed = true;
          }

          return parsedText;
        };
      }

      if (!options.throwHttpError?.disabled && !result.ok) {
        const HttpErrorClass = options.throwHttpError?.errorClass || HttpError;
        throw new HttpErrorClass(result);
      }

      return result;
    };

    // Attach the endpoint so that it can be accessed by tools that wrap the
    // fetch function.
    return Object.assign(fetchFn, {
      endpoint,
      options,
    }) as EndpointFetch<E, Options>;
  }

  /**
   *
   */
  function generate<E extends EndpointTree>(
    endpoints: E,
  ): ClientTree<E, Options> {
    const client = {} as ClientTree<E, Options>;

    for (const name in endpoints) {
      Object.assign(client, {
        [name]: isEndpoint(endpoints[name])
          ? createEndpointFetch(endpoints[name])
          : generate(endpoints[name]),
      });
    }

    return client;
  }

  return {
    generate,
  };
}

/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

/**
 *
 */
export type ClientTree<
  E extends EndpointTree,
  Options extends CreateClientToolkitOptions,
> = {
  [K in keyof E]: E[K] extends Endpoint
    ? EndpointFetch<E[K], Options>
    : E[K] extends EndpointTree
      ? ClientTree<E[K], Options>
      : never;
};

/**
 *
 */
export type EndpointFetch<
  E extends Endpoint,
  O extends CreateClientToolkitOptions,
> = ((
  requestInit: EndpointFetchOptions<E, O>,
) => Promise<EndpointFetchReturn<E, O>>) & {
  endpoint: E;
  options: O;
};

/**
 *
 */
export type EndpointFetchOptions<
  E extends Endpoint,
  O extends CreateClientToolkitOptions,
> = Omit<RequestInit, "method" | "headers" | "body"> &
  OptionalIfNoRequiredKeys<
    EndpointFetchBody<E> &
      EndpointFetchParam<E, "cookie", O> &
      EndpointFetchParam<E, "header", O> &
      EndpointFetchParam<E, "path", O> &
      EndpointFetchParam<E, "query", O>
  >;

/**
 *
 * TODO: Probably want to expand this to check for required keys as well. If
 * keys are all optional we could make the key optional.
 */
export type EndpointFetchBody<E extends Endpoint> =
  IsNever<GetRequestBodyInput<E>> extends true
    ? { body?: undefined }
    : IsUnknown<GetRequestBodyInput<E>> extends true
      ? { body?: undefined }
      : { body: GetRequestBodyInput<E> };

/**
 *
 * TODO: Probably want to expand this to check for required keys as well. If
 * keys are all optional we could make the key optional.
 */
export type EndpointFetchParam<
  E extends Endpoint,
  P extends keyof EndpointRequestParams,
  O extends CreateClientToolkitOptions,
> =
  IsNever<GetRequestParamInput<E, P>> extends true
    ? { [K in EndpointParamOptionMap[P]]?: undefined }
    : IsUnknown<GetRequestParamInput<E, P>> extends true
      ? { [K in EndpointParamOptionMap[P]]?: undefined }
      : { [K in EndpointParamOptionMap[P]]: EndpointFetchParamValue<E, P, O> };

/**
 *
 */
export type EndpointFetchParamValue<
  E extends Endpoint,
  P extends keyof EndpointRequestParams,
  O extends CreateClientToolkitOptions,
> = SetOptionalLoose<
  GetRequestParamInput<E, P>,
  RequiredKeysOfLoose<GetPayloadCreatorRequestParamReturn<O, P>>
>;

/**
 * Map of request param types to fetch options keys.
 */
export type EndpointParamOptionMap = {
  cookie: "cookie";
  header: "headers";
  path: "path";
  query: "query";
};

export type EndpointReturnedStatusCodes<
  E extends Endpoint,
  O extends CreateClientToolkitOptions,
> = O["throwHttpError"] extends { disabled: true }
  ? GetResponseStatusCodes<E>
  : Exclude<
      GetResponseStatusCodes<E>,
      ClientErrorStatusCode | ServerErrorStatusCode
    >;

/**
 *
 */
export type EndpointFetchReturn<
  E extends Endpoint,
  O extends CreateClientToolkitOptions,
> = Omit<Response, "ok" | "status" | "json"> &
  ValueOf<{
    [S in EndpointReturnedStatusCodes<E, O>]: {
      status: S;
      ok: `${S}` extends `2${string}` ? true : false;
      json: () => Promise<GetResponseContentOutput<E, S>>;
    };
  }>;

/**
 *
 */
export type EndpointReturnedData<
  E extends Endpoint,
  O extends CreateClientToolkitOptions,
> = GetResponseContentOutput<E, EndpointReturnedStatusCodes<E, O>>;

// Treats non-2xx status codes as errors (after redirects)
// Retries failed requests
// Timeout support

// JSON option

// Instances with custom defaults
// Hooks
