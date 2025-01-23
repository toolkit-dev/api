/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { createServerToolkit } from "@toolkit-dev/openapi-server-hono";

/* -----------------------------------------------------------------------------
 * server toolkit (stk)
 * -------------------------------------------------------------------------- */

export const stk = createServerToolkit({
  security: {
    schemes: {},
    validators: {},
  },
});
