/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Context, Next } from "hono";

// lib
import { DEFAULT_ROUTE_DELAY } from "../config.js";

/* -----------------------------------------------------------------------------
 * delay middleware
 * -------------------------------------------------------------------------- */

export function delayMiddleware(ms: number = DEFAULT_ROUTE_DELAY) {
  return async (c: Context, next: Next) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await next();
  };
}
