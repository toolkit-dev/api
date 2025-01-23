/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

import { QueryClient } from "@tanstack/react-query";

// 3rd party

/* -----------------------------------------------------------------------------
 * client
 * -------------------------------------------------------------------------- */

/**
 * Options for creating a jsonapi cache for react-query
 */
export type CreateCacheOptions = {};

/**
 * Create a client toolkit.
 */
export function createCache<Options extends CreateCacheOptions>(
  options: Options = {} as Options,
) {
  /**
   *
   */
  function getDataCacheKey(data: any) {
    const resourceUrl = data?.links?.self
      ? new URL(data.links.self)
      : undefined;

    return resourceUrl?.pathname.slice(1).split("/");
  }

  /**
   *
   */
  function cacheData(queryClient: QueryClient, data: any) {
    const queryKey = getDataCacheKey(data);
    const staleTime = data?.meta?.staleTime;
    const gcTime = data?.meta?.gcTime;

    // If there is no self resource link defined, we won't be able to generate a
    // query key and therefore won't be able to cache the resource.
    if (queryKey && (staleTime || gcTime)) {
      const queryDefaults = { ...queryClient.getQueryDefaults(queryKey) };

      staleTime && (queryDefaults.staleTime = staleTime);
      gcTime && (queryDefaults.gcTime = gcTime);

      if (staleTime || gcTime) {
        queryClient.setQueryDefaults(queryKey, queryDefaults);
        queryClient.setQueryData(queryKey, data);

        // TODO: Do I need to attempt to update nested results? This entity
        // existed in a list somewhere or in an included array somewhere. This
        // would be required for true data normalization.
      }
    }
  }

  async function cacheResponse(queryClient: QueryClient, response: Response) {
    const json = await response.json();

    // Cache all data entities
    const data = json?.data;
    if (Array.isArray(data)) {
      data.forEach((resource: any) => cacheData(queryClient, resource));
    } else if (data) {
      cacheData(queryClient, data);
    }

    // Cache all included entities
    const included = json?.included;
    included?.forEach((resource: any) => cacheData(queryClient, resource));

    // Cache self
    cacheData(queryClient, json);
  }

  function getPlaceholderData(queryClient: QueryClient, queryKey: any[]) {
    const placeholderQueryKey = queryKey.slice(0, -1);
    let lastKey = queryKey.at(-1);

    if (typeof lastKey === "object") {
      lastKey = { ...lastKey };
      delete lastKey.include;
    }

    if (typeof lastKey !== "object" || Object.keys(lastKey).length) {
      placeholderQueryKey.push(lastKey);
    }

    return queryClient.getQueryData(placeholderQueryKey);
  }

  return {
    cacheResponse,
    getPlaceholderData,
  };
}
