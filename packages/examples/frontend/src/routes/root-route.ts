/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRootRoute } from "@tanstack/react-router";

// lib
import { DefaultLayout } from "../layouts/default-layout.js";

/* -----------------------------------------------------------------------------
 * rootRoute
 * -------------------------------------------------------------------------- */

export const rootRoute = createRootRoute({
  component: DefaultLayout,
});
