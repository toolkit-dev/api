/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import {
  ErrorDocument,
  ErrorObject,
  LinkObject,
  Relationship,
  Resource,
  ResourceCreateDocument,
  ResourceDocument,
  ResourceIdentifier,
} from "@jsonapi/types";

// lib
import { Strict } from "./utils/types.js";

/* -----------------------------------------------------------------------------
 * public api
 * -------------------------------------------------------------------------- */

/**
 * Create a resource schema
 */
export function resource<S extends ResourceShape>(
  shape: Strict<ResourceShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a resource schema
 */
export function resourceCreate<S extends ResourceCreateShape>(
  shape: Strict<ResourceCreateShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a one to many relationship schema
 */
export function oneToManyRelationship<S extends RelationshipShape>({
  data,
  ...rest
}: Strict<RelationshipShape, S>) {
  const dataSchema = (
    data ? z.array(data) : z.undefined()
  ) as S["data"] extends z.ZodTypeAny ? z.ZodArray<S["data"]> : z.ZodUndefined;

  return z.object({
    data: dataSchema,
    ...rest,
  });
}

/**
 * Create a one to one relationship schema
 */
export function oneToOneRelationship<S extends RelationshipShape>({
  data,
  ...rest
}: Strict<RelationshipShape, S>) {
  const dataSchema = (
    data ? resourceIdentifier(data.shape) : z.undefined()
  ) as S["data"] extends z.ZodTypeAny ? S["data"] : z.ZodUndefined;

  return z.object({
    data: dataSchema,
    ...rest,
  });
}

/**
 * Create a resource document schema
 */
export function resourceDocument<S extends ResourceDocumentShape>(
  shape: Strict<ResourceDocumentShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a resource document schema
 */
export function resourceCreateDocument<S extends ResourceCreateDocumentShape>(
  shape: Strict<ResourceCreateDocumentShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a error document schema
 */
export function errorDocument<S extends ErrorDocumentShape>(
  shape: Strict<ErrorDocumentShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a error object schema
 */
export function errorObject<S extends ErrorObjectShape>(
  shape: Strict<ErrorObjectShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a link schema
 */
export function link<S extends LinkObjectShape>(
  shape: Strict<LinkObjectShape, S>,
) {
  return z.object(shape);
}

/**
 * Create a resource identifier schema
 */
export function resourceIdentifier<S extends ResourceIdentifierShape>(
  shape: Strict<ResourceIdentifierShape, S>,
) {
  return z.object(shape);
}

/* -----------------------------------------------------------------------------
 * builder shapes
 * -------------------------------------------------------------------------- */

type ResourceShape = {
  type: z.ZodType<Resource["type"]>;
  attributes: z.ZodType<Resource["attributes"]>;
  relationships?: z.ZodType<Resource["relationships"]>;
  id: z.ZodType<Resource["id"]>;
  links?: z.ZodType<Resource["links"]>;
  meta?: z.ZodType<Resource["meta"]>;
};

type ResourceCreateShape = {
  type: z.ZodType<Resource["type"]>;
  attributes: z.ZodType<Resource["attributes"]>;
  relationships?: z.ZodType<Resource["relationships"]>;
  id?: z.ZodType<Resource["id"]>;
  links?: z.ZodType<Resource["links"]>;
  meta?: z.ZodType<Resource["meta"]>;
};

type LinkObjectShape = {
  href: z.ZodType<LinkObject["href"]>;
  rel?: z.ZodType<LinkObject["rel"]>;
  describedBy?: z.ZodType<LinkObject["describedBy"]>;
  title?: z.ZodType<LinkObject["title"]>;
  type?: z.ZodType<LinkObject["type"]>;
  hreflang?: z.ZodType<LinkObject["hreflang"]>;
  meta?: z.ZodType<LinkObject["meta"]>;
};

type ResourceIdentifierShape = {
  type: z.ZodType<ResourceIdentifier["type"]>;
  id: z.ZodType<ResourceIdentifier["id"]>;
  meta?: z.ZodType<ResourceIdentifier["meta"]>;
};

type RelationshipShape =
  | {
      data: z.ZodObject<ResourceIdentifierShape>;
      links?: z.ZodType<Relationship["links"]>;
      meta?: z.ZodType<Relationship["meta"]>;
    }
  | {
      data: z.ZodObject<ResourceIdentifierShape>;
      links: z.ZodType<Relationship["links"]>;
      meta?: z.ZodType<Relationship["meta"]>;
    };

type ResourceDocumentShape = {
  data: z.ZodType<ResourceDocument["data"]>;
  links?: z.ZodType<ResourceDocument["links"]>;
  meta?: z.ZodType<ResourceDocument["meta"]>;
  jsonapi?: z.ZodType<ResourceDocument["jsonapi"]>;
  included?: z.ZodType<ResourceDocument["included"]>;
};

type ResourceCreateDocumentShape = {
  data: z.ZodType<ResourceCreateDocument["data"]>;
  links?: z.ZodType<ResourceCreateDocument["links"]>;
  meta?: z.ZodType<ResourceCreateDocument["meta"]>;
  jsonapi?: z.ZodType<ResourceCreateDocument["jsonapi"]>;
  included?: z.ZodType<ResourceCreateDocument["included"]>;
};

type ErrorDocumentShape = {
  errors?: z.ZodType<ErrorDocument["errors"]>;
  links?: z.ZodType<ErrorDocument["links"]>;
  meta?: z.ZodType<ErrorDocument["meta"]>;
  jsonapi?: z.ZodType<ErrorDocument["jsonapi"]>;
  included?: z.ZodType<ErrorDocument["included"]>;
};

type ErrorObjectShape = {
  id?: z.ZodType<ErrorObject["id"]>;
  status?: z.ZodType<ErrorObject["status"]>;
  code?: z.ZodType<ErrorObject["code"]>;
  title?: z.ZodType<ErrorObject["title"]>;
  detail?: z.ZodType<ErrorObject["detail"]>;
  source?: z.ZodType<ErrorObject["source"]>;
  meta?: z.ZodType<ErrorObject["meta"]>;
};
