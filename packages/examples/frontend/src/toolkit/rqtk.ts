/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// toolkit
import { createReactQueryToolkit } from "@toolkit-dev/react-query-fetch";
import { createCache } from "@toolkit-dev/react-query-jsonapi";

/* -----------------------------------------------------------------------------
 * client
 * -------------------------------------------------------------------------- */

export const rqtk = createReactQueryToolkit({
  // To take full advantage of json, we can seed our cache with resources that
  // get sent down. For this to work, we need to instruct our system to cache
  // and return resources rather than the entire document. The full document
  // can still be accessed if required by using the `getOriginalJson` function
  // in conjunction with, `requiresOriginalJson` flag.
  returnValue: { type: "json", select: "data" },

  // Enable automatic caching of jsonapi resources.
  cache: createCache(),
});
