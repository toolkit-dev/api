/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// toolkit
import { getEndpointRequestContentType } from "@toolkit-dev/openapi-core/endpoint";
import { createClientToolkit } from "@toolkit-dev/openapi-client-fetch";

// lib
import { BASE_URL } from "../config.js";

/* -----------------------------------------------------------------------------
 * client toolkit (ctk)
 * -------------------------------------------------------------------------- */

export const ctk = createClientToolkit({
  baseUrl: BASE_URL,

  payloadCreators: {
    requestParams: {
      header: (endpoint) => {
        return {
          "content-type": getEndpointRequestContentType(endpoint),
          "x-release-version": "123",
        };
      },
    },
  },
});
