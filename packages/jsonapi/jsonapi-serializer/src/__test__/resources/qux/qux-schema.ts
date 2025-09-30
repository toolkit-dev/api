/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { barSchema } from "../bar/bar-schema.js";

/* -----------------------------------------------------------------------------
 * Qux schema
 * -------------------------------------------------------------------------- */

export type QuxFields = z.output<typeof quxFields>;
export const quxFields = z.object({
  id: z.coerce.string(),
  barId: z.coerce.string(),
  attr: z.string(),
});

export type Qux = z.output<typeof quxSchema>;
export const quxSchema = quxFields.extend({
  bar: z.lazy(() => barSchema).optional(),
});

export type QuxCreateInput = z.input<typeof quxCreateSchema>;
export type QuxCreateOutput = z.output<typeof quxCreateSchema>;
export const quxCreateSchema = quxFields.omit({ id: true });

export type QuxUpdateInput = z.input<typeof quxUpdateSchema>;
export type QuxUpdateOutput = z.output<typeof quxUpdateSchema>;
export const quxUpdateSchema = quxFields.partial();

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
