/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { postEndpoints } from "./resources/post/post-endpoints.js";
import { userEndpoints } from "./resources/user/user-endpoints.js";

/* -----------------------------------------------------------------------------
 * openapi document
 * -------------------------------------------------------------------------- */

export const endpoints = {
  post: postEndpoints,
  user: userEndpoints,
};
