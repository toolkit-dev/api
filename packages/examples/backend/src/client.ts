/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { ctk } from "./toolkit/ctk.js";
import { endpoints } from "./endpoints.js";

/* -----------------------------------------------------------------------------
 * client
 * -------------------------------------------------------------------------- */

export const client = ctk.generate(endpoints);
