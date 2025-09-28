/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { Bar, barSchema } from "../bar/bar-schema.js";
import { Baz, bazSchema } from "../baz/baz-schema.js";

/* -----------------------------------------------------------------------------
 * Foo schema
 * -------------------------------------------------------------------------- */

export type FooFields = z.output<typeof fooFields>;
export const fooFields = z.object({
  id: z.coerce.string(),
  bazId: z.coerce.string(),
  attr: z.string(),
});

export type Foo = z.output<typeof fooFields> & {
  bars?: Bar[];
  baz?: Baz;
};
export const fooSchema = fooFields.extend({
  bars: z.lazy(() => z.array(barSchema)).optional(),
  baz: z.lazy(() => bazSchema).optional(),
});

export type FooCreateInput = z.input<typeof fooCreateSchema>;
export type FooCreateOutput = z.output<typeof fooCreateSchema>;
export const fooCreateSchema = fooFields.omit({ id: true });

export type FooUpdateInput = z.input<typeof fooUpdateSchema>;
export type FooUpdateOutput = z.output<typeof fooUpdateSchema>;
export const fooUpdateSchema = fooFields.partial();

export type FooResource = z.output<typeof fooResourceSchema>;
export const fooResourceSchema = j.resource({
  type: z.literal("foo"),
  id: z.string(),
  attributes: fooFields.omit({ id: true }).extend({
    bazValue: z.string(),
  }),
  relationships: z.object({
    bars: j.oneToManyRelationship({
      data: j.resourceIdentifier({ type: z.literal("bar"), id: z.string() }),
      links: z.object({ self: z.string(), related: z.string() }),
    }),
  }),
  links: z.object({
    self: z.string(),
  }),
});

export type FooArtifacts = {
  barsByFooId: Record<string, Bar[]>;
  bazsByFooId: Record<string, Baz>;
};

export type FooDocument = z.output<typeof fooDocumentSchema>;
export const fooDocumentSchema = j.resourceDocument({
  data: fooResourceSchema,
  links: z.object({ self: z.string() }),
  meta: z.object({ prop: z.string() }),
});
