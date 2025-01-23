/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// lib
import * as j from "../../jsonapi-builder-zod.js";

/* -----------------------------------------------------------------------------
 * bar
 * -------------------------------------------------------------------------- */

export type BarModel = z.output<typeof barModelSchema>;
export const barModelSchema = z.object({
  id: z.string(),
  prop: z.string(),
});

export type BarResource = z.output<typeof barResourceSchema>;
export const barResourceSchema = j.resource({
  type: z.literal("bar"),
  id: z.string(),
  attributes: barModelSchema.omit({
    id: true,
  }),
});
