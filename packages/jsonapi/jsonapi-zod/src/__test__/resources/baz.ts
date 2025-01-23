/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// lib
import * as j from "../../jsonapi-builder-zod.js";

/* -----------------------------------------------------------------------------
 * baz
 * -------------------------------------------------------------------------- */

export type BazModel = z.output<typeof bazModelSchema>;
export const bazModelSchema = z.object({
  id: z.string(),
  prop: z.string(),
});

export type BazResource = z.output<typeof bazResourceSchema>;
export const bazResourceSchema = j.resource({
  type: z.literal("baz"),
  id: z.string(),
  attributes: bazModelSchema.omit({
    id: true,
  }),
  meta: z.object({
    prop: z.string(),
  }),
});
