/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import type { StandardSchemaV1 } from "@standard-schema/spec";
// TODO: REMOVE THIS HONO DEPENDENCY
import { ContentfulStatusCode } from "hono/utils/http-status";
import { OmitIndexSignature } from "type-fest";
// TODO: REMOVE ALL ZOD DEPENDENCIES
import { ZodType } from "zod";
import {
  ZodOpenApiCallbackObject,
  ZodOpenApiCallbacksObject,
  ZodOpenApiMediaTypeObject,
  ZodOpenApiOperationObject,
  ZodOpenApiParameters,
  ZodOpenApiPathItemObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from "zod-openapi";

// lib
import { GetSchemaInput, GetSchemaOutput, standardValidate } from "./schema.js";

/* -----------------------------------------------------------------------------
 * types - core
 * -------------------------------------------------------------------------- */

/**
 * A tree of endpoints.
 */
export type EndpointTree = {
  [key: string]: EndpointTree | Endpoint;
};

/**
 * Normalized endpoint type.
 */
export type Endpoint<
  Method extends EndpointMethod = EndpointMethod,
  Path extends string = string,
  Operation extends EndpointOperation = EndpointOperation,
> = {
  __internal__: {
    method: Method;
    path: Path;
    operation: Operation;
  };
};

/**
 * All endpoint methods supported by openapi.
 */
export type EndpointMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

/**
 * All valid status code keys for openapi responses.
 */
export type EndpointStatusCodeKey = `${1 | 2 | 3 | 4 | 5}${string}`;

/**
 * A normalized endpoint operation type.
 *
 * NOTE: In a future version, it would be ideal to replicate this behavior
 * without relying on zod-openapi. Instead we should redefine these types on
 * our own.
 */

export interface EndpointOperation
  extends Omit<
    ZodOpenApiOperationObject,
    "parameters" | "requestParams" | "requestBody" | "responses" | "callbacks"
  > {
  // Replace schemas with expanded version
  requestParams?: EndpointRequestParams;
  requestBody?: EndpointRequestBody;
  responses?: EndpointResponses;
  callbacks?: EndpointCallbacks;
}

/* -----------------------------------------------------------------------------
 * types - zod-openapi "expanded" overwrites
 * -------------------------------------------------------------------------- */

export type EndpointRequestParams = {
  [key in keyof ZodOpenApiParameters]: StandardSchemaV1;
};

export interface EndpointRequestBody
  extends Omit<ZodOpenApiRequestBodyObject, "content"> {
  content: EndpointContentObject;
}

export interface EndpointContentObject {
  "application/json"?: EndpointMediaTypeObject;
  [mediatype: string]: EndpointMediaTypeObject | undefined;
}

export interface EndpointMediaTypeObject
  extends Omit<ZodOpenApiMediaTypeObject, "schema"> {
  schema?:
    | StandardSchemaV1
    | Exclude<ZodOpenApiMediaTypeObject["schema"], ZodType>;
}

export interface EndpointResponses
  extends OmitIndexSignature<Omit<ZodOpenApiResponsesObject, "default">> {
  [statusCode: string]:
    | Exclude<
        ZodOpenApiResponsesObject[EndpointStatusCodeKey],
        ZodOpenApiResponseObject
      >
    | EndpointResponseObject;
}

export interface EndpointResponseObject
  extends Omit<ZodOpenApiResponseObject, "content" | "headers"> {
  content?:
    | Exclude<ZodOpenApiResponseObject["content"], ZodOpenApiMediaTypeObject>
    | EndpointContentObject;
  headers?:
    | Exclude<ZodOpenApiResponseObject["headers"], ZodType>
    | StandardSchemaV1;
}

export interface EndpointCallbacks
  extends OmitIndexSignature<ZodOpenApiCallbacksObject> {
  [name: string]: EndpointCallbackObject;
}

export interface EndpointCallbackObject
  extends OmitIndexSignature<ZodOpenApiCallbackObject> {
  [name: string]:
    | Exclude<ZodOpenApiCallbackObject[string], ZodOpenApiPathItemObject>
    | EndpointPathItemObject;
}

export type EndpointPathItemObject = {
  [key in keyof ZodOpenApiPathItemObject]: EndpointOperation;
};

/* -----------------------------------------------------------------------------
 * types - request accessors
 * -------------------------------------------------------------------------- */

export type GetRequestParams<E extends Endpoint> =
  E["__internal__"]["operation"]["requestParams"];

export type GetRequestParamSchema<
  E extends Endpoint,
  K extends keyof EndpointRequestParams,
> =
  GetRequestParams<E> extends { [key in K]: StandardSchemaV1 }
    ? GetRequestParams<E>[K]
    : undefined;

export type GetRequestParamInput<
  E extends Endpoint,
  K extends keyof EndpointRequestParams,
> = GetSchemaInput<GetRequestParamSchema<E, K>>;

export type GetRequestParamOutput<
  E extends Endpoint,
  K extends keyof EndpointRequestParams,
> = GetSchemaOutput<GetRequestParamSchema<E, K>>;

export type GetRequestBody<E extends Endpoint> =
  E["__internal__"]["operation"]["requestBody"];

export type GetRequestBodyContent<E extends Endpoint> =
  GetRequestBody<E> extends { content: EndpointContentObject }
    ? GetRequestBody<E>["content"]
    : undefined;

export type GetRequestBodySchema<E extends Endpoint> =
  GetRequestBodyContent<E> extends {
    "application/json": EndpointMediaTypeObject;
  }
    ? GetRequestBodyContent<E>["application/json"]["schema"]
    : undefined;

export type GetRequestBodyInput<E extends Endpoint> = GetSchemaInput<
  GetRequestBodySchema<E>
>;

export type GetRequestBodyOutput<E extends Endpoint> = GetSchemaOutput<
  GetRequestBodySchema<E>
>;

/* -----------------------------------------------------------------------------
 * types - response accessors
 * -------------------------------------------------------------------------- */

export type GetResponses<E extends Endpoint> =
  E["__internal__"]["operation"]["responses"];

export type GetResponse<E extends Endpoint, S extends ContentfulStatusCode> =
  GetResponses<E> extends { [key in S]: EndpointResponseObject }
    ? GetResponses<E>[S]
    : undefined;

export type GetResponseContent<
  E extends Endpoint,
  S extends ContentfulStatusCode,
> =
  GetResponse<E, S> extends { content: EndpointContentObject }
    ? GetResponse<E, S>["content"]
    : undefined;

export type GetResponseContentSchema<
  E extends Endpoint,
  S extends ContentfulStatusCode,
> =
  GetResponseContent<E, S> extends {
    "application/json": EndpointMediaTypeObject;
  }
    ? GetResponseContent<E, S>["application/json"]["schema"]
    : undefined;

export type GetResponseContentOutput<
  E extends Endpoint,
  S extends ContentfulStatusCode,
> = GetSchemaOutput<GetResponseContentSchema<E, S>>;

export type GetResponseContentInput<
  E extends Endpoint,
  S extends ContentfulStatusCode,
> = GetSchemaInput<GetResponseContentSchema<E, S>>;

export type GetResponseStatusCodes<E extends Endpoint> =
  keyof GetResponses<E> extends ContentfulStatusCode
    ? keyof GetResponses<E>
    : never;

export type GetResponseOutputsByStatusCode<E extends Endpoint> = {
  [S in GetResponseStatusCodes<E>]: GetResponseContentOutput<E, S>;
};

/* -----------------------------------------------------------------------------
 * utils - general
 * -------------------------------------------------------------------------- */

/**
 * Check if an object is an endpoint.
 */
export function isEndpoint(endpoint: any): endpoint is Endpoint {
  // TODO: use a unique symbol and check that symbol instead.
  return "__internal__" in endpoint;
}

/**
 * Validate a schema if it exists in a format in which it can be validated.
 */
export async function validateSchema<
  Schema extends EndpointMediaTypeObject["schema"] | undefined,
>(schema: Schema, data: unknown) {
  return schema && "~standard" in schema
    ? await standardValidate(schema, data)
    : data;
}

/* -----------------------------------------------------------------------------
 * utils - response
 * -------------------------------------------------------------------------- */

/**
 * Get the responses from an endpoint.
 */
export function getResponses<E extends Endpoint>(endpoint: E): GetResponses<E> {
  return endpoint.__internal__.operation.responses;
}

/**
 * Get the response content schema from an endpoint.
 */
export function getResponseContentSchema<
  E extends Endpoint,
  S extends ContentfulStatusCode,
>(endpoint: E, statusCode: S): GetResponseContentSchema<E, S> {
  const response = getResponses(endpoint)?.[`${statusCode}`];

  return (
    response && "content" in response
      ? response.content?.["application/json"]?.schema
      : undefined
  ) as GetResponseContentSchema<E, S>;
}

/**
 * Validate the response content of an endpoint.
 */
export async function validateResponseContent<
  E extends Endpoint,
  S extends ContentfulStatusCode,
>(
  endpoint: E,
  statusCode: S,
  content: GetResponseContentInput<E, S>,
): Promise<GetResponseContentOutput<E, S>> {
  const schema = getResponseContentSchema(endpoint, statusCode);
  const data = await validateSchema(schema, content);

  // NOTE: We need to manually assert here because validateSchema widens the
  // type but our return type expects a narrower type.
  return data as GetResponseContentOutput<E, S>;
}

/* -----------------------------------------------------------------------------
 * utils - request
 * -------------------------------------------------------------------------- */

/**
 * Get the request param schema from an endpoint.
 */
export function getRequestParamSchema<
  E extends Endpoint,
  P extends keyof EndpointRequestParams,
>(endpoint: E, paramKey: P): GetRequestParamSchema<E, P> {
  return endpoint.__internal__.operation.requestParams?.[
    paramKey
  ] as GetRequestParamSchema<E, P>;
}

/**
 * Validate a request query.
 */
export async function validateRequestQuery<E extends Endpoint>(
  endpoint: E,
  value: unknown,
): Promise<GetRequestParamOutput<E, "query">> {
  return validateSchema(
    getRequestParamSchema(endpoint, "query"),
    value,
  ) as GetRequestParamOutput<E, "query">;
}

/**
 * Validate a request header.
 */
export async function validateRequestHeader<E extends Endpoint>(
  endpoint: E,
  value: unknown,
): Promise<GetRequestParamOutput<E, "header">> {
  return validateSchema(
    getRequestParamSchema(endpoint, "header"),
    value,
  ) as GetRequestParamOutput<E, "header">;
}

/**
 * Validate a request cookie.
 */
export async function validateRequestCookie<E extends Endpoint>(
  endpoint: E,
  value: unknown,
): Promise<GetRequestParamOutput<E, "cookie">> {
  return validateSchema(
    getRequestParamSchema(endpoint, "cookie"),
    value,
  ) as GetRequestParamOutput<E, "cookie">;
}
/**
 * Validate a request path.
 */
export async function validateRequestPath<E extends Endpoint>(
  endpoint: E,
  value: unknown,
): Promise<GetRequestParamOutput<E, "path">> {
  return validateSchema(
    getRequestParamSchema(endpoint, "path"),
    value,
  ) as GetRequestParamOutput<E, "path">;
}

/**
 * Get the request body schema from an endpoint.
 */
export function getRequestBodySchema<E extends Endpoint>(
  endpoint: E,
): GetRequestBodySchema<E> {
  return endpoint.__internal__.operation.requestBody?.content[
    "application/json"
  ]?.schema as GetRequestBodySchema<E>;
}

/**
 * Validate a request body.
 */
export async function validateRequestBody<E extends Endpoint>(
  endpoint: E,
  value: unknown,
): Promise<GetRequestBodyOutput<E>> {
  return validateSchema(
    getRequestBodySchema(endpoint),
    value,
  ) as GetRequestBodyOutput<E>;
}

/**
 * Get the default request content type for an endpoint.
 */
export function getEndpointRequestContentType<E extends Endpoint>(
  endpoint: E,
): string {
  const requestBody = endpoint.__internal__.operation.requestBody;
  if (requestBody?.content["application/json"]) {
    return "application/json";
  } else {
    const firstContentType = Object.keys(requestBody?.content || {})[0];
    return firstContentType || "application/octet-stream";
  }
}
