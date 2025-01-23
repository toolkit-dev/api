/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { j } from "@jsonapi/zod";

/* -----------------------------------------------------------------------------
 * Qux schema
 * -------------------------------------------------------------------------- */

export type QuxFields = z.output<typeof quxFields>;
export const quxFields = z.object({
  id: z.coerce.string(),
  barId: z.coerce.string(),
  attr: z.string(),
});

export type QuxResource = z.output<typeof quxResourceSchema>;
export const quxResourceSchema = j.resource({
  type: z.literal("qux"),
  id: z.string(),
  attributes: quxFields.omit({
    id: true,
  }),
  relationships: z.object({
    bar: j.oneToOneRelationship({
      data: j.resourceIdentifier({ type: z.literal("bar"), id: z.string() }),
      links: z.object({ self: z.string(), related: z.string() }),
    }),
  }),
  links: z.object({
    self: z.string(),
  }),
});
