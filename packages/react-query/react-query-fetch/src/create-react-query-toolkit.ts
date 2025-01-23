/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import {
  DefaultError,
  queryOptions,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { Simplify } from "type-fest";

// toolkit
import {
  EndpointFetchReturn,
  EndpointReturnedData,
} from "@toolkit-dev/openapi-client-fetch";
import { buildUrl } from "@toolkit-dev/openapi-core/client";

// lib
import { Cache } from "./cache.js";
import { httpErrorRetry } from "./http-error-retry.js";

/* -----------------------------------------------------------------------------
 * create-react-query-toolkit
 * -------------------------------------------------------------------------- */

const DEFAULT_RETRY_COUNT = 3;

/**
 * Options for creating a react-query toolkit.
 */
export type CreateReactQueryToolkitOptions = {
  /**
   *
   */
  returnValue?:
    | { type: "json" | "text"; select?: undefined }
    | { type: "json"; select?: string };

  /**
   * The caching instance to use. For example, you can ue the jsonapi cache to
   * automatically cache resources from a jsonapi response.
   */
  cache?: Cache;

  /**
   * Allows setting global retry behavior. By default, this will use the
   * httpErrorRetry strategy, which only retries requests that result in a 5XX
   * error.
   */
  retry?: UseQueryOptions<any, any, any, any>["retry"] | null;

  /**
   * Allows setting global retry delay behavior.
   */
  retryDelay?: UseQueryOptions<any, any, any, any>["retryDelay"];
};

/**
 * Create a react-query toolkit.
 */
export function createReactQueryToolkit<
  const O extends CreateReactQueryToolkitOptions,
>(options: O = {} as O) {
  /**
   *
   */
  function createQueryKey<F extends AnyEndpointFetch>(
    fetch: F,
    fetchOptions: Parameters<F>[0],
  ) {
    const url = new URL(
      buildUrl({
        baseUrl: fetch.options.baseUrl,
        path: fetch.endpoint.__internal__.path,
        pathParams: fetchOptions.path,
        queryParams: fetchOptions.query,
      }),
    );

    const queryKeys = url.pathname.slice(1).split("/");
    if (fetchOptions.query) {
      queryKeys.push(fetchOptions.query);
    }

    return queryKeys;
  }

  /**
   *
   */
  function useQueryOptions<
    F extends AnyEndpointFetch,
    P extends boolean = false,
    S extends any = QueryFnReturn<F, O, P>,
  >(
    fetch: F,
    { fetch: fetchOptions, ...restQueryOptions }: QueryOptions<F, O, S, P>,
  ) {
    const queryClient = useQueryClient();
    const queryKey = createQueryKey(fetch, fetchOptions);
    const placeholderData = options.cache?.getPlaceholderData(
      queryClient,
      queryKey,
    );

    // If the retry delay is not set, the default react-query exponential
    // backoff will be used.
    const retryDelay = options.retryDelay;

    // If the retry is not set, we can use the default httpErrorRetry strategy
    // which more intelligently ONLY retries 5XX errors.
    const retry =
      options.retry !== null
        ? httpErrorRetry({ retryCount: DEFAULT_RETRY_COUNT })
        : undefined;

    return queryOptions({
      placeholderData,
      queryKey,
      retry,
      retryDelay,
      queryFn: async () => {
        const response = await fetch(fetchOptions);

        if (options.cache) {
          await options.cache.cacheResponse(queryClient, response);
        }

        if (options.returnValue?.type === "text") {
          return await response.text();
        }

        const json = await response.json();

        console.log(response.status);

        if (options.returnValue?.select) {
          // Delete the selected value and store everything else in the
          // __internal__ property. This ensures we still have access to it
          // while removing circular references.
          const __internal__ = { extra: { ...json } };
          delete __internal__.extra[options.returnValue.select];

          return Object.assign(json[options.returnValue.select], {
            __internal__,
          });
        } else {
          return json;
        }
      },
      ...restQueryOptions,
    });
  }

  /**
   *
   */
  function useMutationOptions() {}

  type DataWithRequiredExtra = { data: { __internal__: { extra: any } } };
  type DataWithOptionalExtra = { data: { __internal__: { extra?: any } } };

  /**
   *
   */
  function selectExtra<
    Q extends DataWithRequiredExtra | DataWithOptionalExtra,
    K extends keyof Exclude<Q["data"]["__internal__"]["extra"], undefined>,
  >(
    query: Q,
    key: K,
  ): Q extends DataWithRequiredExtra
    ? Exclude<Q["data"]["__internal__"]["extra"], undefined>[K]
    : Exclude<Q["data"]["__internal__"]["extra"], undefined>[K] | undefined {
    return query.data.__internal__?.extra?.[key];
  }

  return {
    useQueryOptions,
    useMutationOptions,
    selectExtra,
  };
}

/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

export type AnyEndpointFetch = ((requestInit: any) => Promise<any>) & {
  endpoint: any;
  options: any;
};

export type QueryFnReturn<
  F extends AnyEndpointFetch,
  O extends CreateReactQueryToolkitOptions,
  P extends boolean,
> = O["returnValue"] extends { type: "text" }
  ? string
  : Simplify<
      FetchDataReturned<F, O> & {
        __internal__: QueryFnReturnedExtra<
          ReturnValueSelect<O> extends string
            ? Omit<FetchData<F>, ReturnValueSelect<O>>
            : never,
          P
        >;
      }
    >;

export type QueryFnReturnedExtra<V, P extends boolean> = P extends true
  ? { extra?: V }
  : { extra: V };

export type FetchDataReturned<
  F extends AnyEndpointFetch,
  O extends CreateReactQueryToolkitOptions,
> = O["returnValue"] extends { select: string }
  ? FetchData<F> extends { [K in ReturnValueSelect<O>]: any }
    ? FetchData<F>[ReturnValueSelect<O>]
    : never
  : FetchData<F>;

export type ReturnValueSelect<O extends CreateReactQueryToolkitOptions> =
  O["returnValue"] extends { select: string }
    ? O["returnValue"]["select"]
    : never;

export type FetchData<F extends AnyEndpointFetch> = EndpointReturnedData<
  F["endpoint"],
  F["options"]
>;

export type FetchReturn<F extends AnyEndpointFetch> = EndpointFetchReturn<
  F["endpoint"],
  F["options"]
>;

type QueryOptions<
  F extends AnyEndpointFetch,
  O extends CreateReactQueryToolkitOptions,
  S extends any,
  P extends boolean,
> = {
  fetch: Parameters<F>[0];
  useCachedPlaceholderData?: P;
} & Omit<
  UseQueryOptions<QueryFnReturn<F, O, P>, DefaultError, S, any[]>,
  "queryFn" | "queryKey"
>;

// export type EndpointFetchReturn<
//   E extends Endpoint,
//   O extends CreateClientToolkitOptions,
// > = Omit<Response, "ok" | "status" | "json"> &
//   ValueOf<{
//     [S in EndpointReturnedStatusCodes<E, O>]: {
//       status: S;
//       ok: `${S}` extends `2${string}` ? true : false;
//       json: () => Promise<GetResponseContentOutput<E, S>>;
//     };
//   }>;
