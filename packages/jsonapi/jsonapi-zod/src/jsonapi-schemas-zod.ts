/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// lib
import { JsonValue } from "@jsonapi/types";

/* -----------------------------------------------------------------------------
 * jsonapi schemas
 * -------------------------------------------------------------------------- */

/**
 * json value schema
 */
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

/**
 * meta schema
 */
export const metaSchema = z.record(z.any());

/**
 * link object schema
 */
export const linkObjectSchema = z.object({
  href: z.string(),
  rel: z.string().optional(),
  describedBy: z.string().optional(),
  title: z.string().optional(),
  type: z.string().optional(),
  hreflang: z.string().optional(),
  meta: z.object({}).optional(),
});

/**
 * link schema
 */
export const linkSchema = z.union([z.null(), z.string(), linkObjectSchema]);

/**
 * resource identifier schema
 */
export const resourceIdentifierSchema = z.object({
  type: z.string(),
  id: z.string(),
  meta: metaSchema.optional(),
});

/**
 * relationship links schema
 */
export const relationshipLinksSchema = z.union([
  z.null(),
  z.object({ self: linkSchema }).and(z.record(linkSchema)),
  z.object({ related: linkSchema }).and(z.record(linkSchema)),
]);

/**
 * resource linkage schema
 */
export const resourceLinkageSchema = z.union([
  z.null(),
  resourceIdentifierSchema,
  z.array(resourceIdentifierSchema),
]);

/**
 * relationship schema
 */
export const relationshipSchema = z.union([
  z.object({
    links: relationshipLinksSchema,
    data: resourceLinkageSchema.optional(),
    meta: metaSchema.optional(),
  }),
  z.object({
    links: relationshipLinksSchema.optional(),
    data: resourceLinkageSchema,
    meta: metaSchema.optional(),
  }),
]);

/**
 * attributes schema
 */
export const attributesSchema = z.record(z.any());

/**
 * resource schema
 */
export const resourceSchema = z.object({
  type: z.string(),
  id: z.string(),
  attributes: z.record(z.any()),
  relationships: z.record(relationshipSchema).optional(),
  links: z.record(linkSchema).optional(),
  meta: metaSchema.optional(),
});

/**
 * error object schema
 */
export const errorObjectSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  code: z.string().optional(),
  title: z.string().optional(),
  detail: z.string().optional(),
  source: z.object({
    pointer: z.string().optional(),
    parameter: z.string().optional(),
    header: z.string().optional(),
  }),
  links: z.object({
    about: linkSchema.optional(),
    type: linkSchema.optional(),
  }),
  meta: metaSchema.optional(),
});

/**
 * jsonapi schema
 */
export const jsonapiSchema = z.object({
  version: z.string().optional(),
  ext: z.array(z.string()).optional(),
  profile: z.array(z.string()).optional(),
  meta: metaSchema.optional(),
});

/**
 * document links schema
 */
export const documentLinks = z.object({
  self: linkSchema.optional(),
  related: linkSchema.optional(),
  first: linkSchema.optional(),
  last: linkSchema.optional(),
  prev: linkSchema.optional(),
  next: linkSchema.optional(),
  describedBy: linkSchema.optional(),
});

/**
 * resource document schema
 */
export const resourceDocumentSchema = z.object({
  data: z.union([resourceSchema, z.array(resourceSchema)]).optional(),
  meta: metaSchema.optional(),
  links: documentLinks.optional(),
  included: z.array(resourceSchema).optional(),
  jsonapi: jsonapiSchema.optional(),
});

/**
 * error document schema
 */
export const errorDocumentSchema = z.object({
  errors: z.array(errorObjectSchema).optional(),
  meta: metaSchema.optional(),
  links: documentLinks.optional(),
  included: z.array(resourceSchema).optional(),
  jsonapi: jsonapiSchema.optional(),
});
