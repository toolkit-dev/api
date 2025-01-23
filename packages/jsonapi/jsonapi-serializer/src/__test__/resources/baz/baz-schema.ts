/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { j } from "@jsonapi/zod";

/* -----------------------------------------------------------------------------
 * Baz schema
 * -------------------------------------------------------------------------- */

export type BazFields = z.output<typeof bazFields>;
export const bazFields = z.object({
  id: z.coerce.string(),
  value: z.string(),
});

export type BazResource = z.output<typeof bazResourceSchema>;
export const bazResourceSchema = j.resource({
  type: z.literal("baz"),
  id: z.string(),
  attributes: bazFields.omit({
    id: true,
  }),
  links: z.object({
    self: z.string(),
  }),
});
