/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { QueryClient } from "@tanstack/react-query";

/* -----------------------------------------------------------------------------
 * create-react-query-toolkit
 * -------------------------------------------------------------------------- */

/**
 * Generic cache interface.
 */
export type Cache = {
  /**
   * Cache a response.
   */
  cacheResponse: (queryClient: QueryClient, response: Response) => void;

  /**
   *
   */
  getPlaceholderData: (queryClient: QueryClient, queryKey: any[]) => any;
};
