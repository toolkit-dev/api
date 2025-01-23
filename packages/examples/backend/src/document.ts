/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { dtk } from "./toolkit/dtk.js";
import { endpoints } from "./endpoints.js";

/* -----------------------------------------------------------------------------
 * openapi document
 * -------------------------------------------------------------------------- */

export const openapiDocument = dtk.document(endpoints);
