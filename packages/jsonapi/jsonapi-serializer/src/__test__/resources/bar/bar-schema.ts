/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { Foo, fooSchema } from "../foo/foo-schema.js";

/* -----------------------------------------------------------------------------
 * Bar schema
 * -------------------------------------------------------------------------- */

export type BarFields = z.output<typeof barFields>;
export const barFields = z.object({
  id: z.coerce.string(),
  fooId: z.coerce.string(),
  attr: z.string(),
});

export type Bar = z.output<typeof barFields> & {
  foo?: Foo;
};
export const barSchema: z.ZodType<Bar> = barFields.extend({
  foo: z.lazy(() => fooSchema).optional(),
});

export type BarCreateInput = z.input<typeof barCreateSchema>;
export type BarCreateOutput = z.output<typeof barCreateSchema>;
export const barCreateSchema = barFields.omit({ id: true });

export type BarUpdateInput = z.input<typeof barUpdateSchema>;
export type BarUpdateOutput = z.output<typeof barUpdateSchema>;
export const barUpdateSchema = barFields.partial();

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
