/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// lib
import * as j from "../../jsonapi-builder-zod.js";
import { barResourceSchema } from "./bar.js";
import { bazResourceSchema } from "./baz.js";

/* -----------------------------------------------------------------------------
 * foo
 * -------------------------------------------------------------------------- */

export type FooModel = z.output<typeof fooModelSchema>;
export const fooModelSchema = z.object({
  id: z.string(),
  prop: z.string(),
});

export type FooResource = z.output<typeof fooResourceSchema>;
export const fooResourceSchema = j.resource({
  type: z.literal("foo"),
  id: z.string(),
  attributes: fooModelSchema.omit({
    id: true,
  }),
  relationships: z.object({
    bars: j.oneToManyRelationship({
      data: j.resourceIdentifier({ type: z.literal("bar"), id: z.string() }),
      links: z.object({ self: z.string(), related: z.string() }),
    }),
    baz: j.oneToOneRelationship({
      data: j.resourceIdentifier({ type: z.literal("baz"), id: z.string() }),
      meta: z.object({ prop: z.string() }),
    }),
  }),
});

export type FooDocument = z.output<typeof fooDocumentSchema>;
export const fooDocumentSchema = j.resourceDocument({
  data: fooResourceSchema,
  included: z.array(z.union([barResourceSchema, bazResourceSchema])),
});
