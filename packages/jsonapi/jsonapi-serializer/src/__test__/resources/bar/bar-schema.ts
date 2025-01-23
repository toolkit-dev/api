/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { j } from "@jsonapi/zod";

/* -----------------------------------------------------------------------------
 * Bar schema
 * -------------------------------------------------------------------------- */

export type BarFields = z.output<typeof barFields>;
export const barFields = z.object({
  id: z.coerce.string(),
  fooId: z.coerce.string(),
  attr: z.string(),
});

export type BarResource = z.output<typeof barResourceSchema>;
export const barResourceSchema = j.resource({
  type: z.literal("bar"),
  id: z.string(),
  attributes: barFields.omit({
    id: true,
  }),
  relationships: z.object({
    foo: j.oneToOneRelationship({
      data: j.resourceIdentifier({ type: z.literal("foo"), id: z.string() }),
      links: z.object({ self: z.string(), related: z.string() }),
    }),
  }),
  links: z.object({
    self: z.string(),
  }),
});
