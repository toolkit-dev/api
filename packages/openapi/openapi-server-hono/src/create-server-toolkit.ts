/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { StandardSchemaV1 } from "@standard-schema/spec";
import { Context, MiddlewareHandler, TypedResponse } from "hono";
import { every } from "hono/combine";
import { validator } from "hono/validator";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { BaseMime } from "hono/utils/mime";
import { ResponseHeader } from "hono/utils/headers";
import { ComponentsObject } from "openapi3-ts/oas31";

// toolkit
import {
  Endpoint,
  GetRequestBodySchema,
  GetRequestParamSchema,
  GetResponseContentInput,
  GetResponseContentOutput,
  GetResponseStatusCodes,
  validateRequestBody,
  validateRequestCookie,
  validateRequestHeader,
  validateRequestPath,
  validateRequestQuery,
  validateResponseContent,
} from "@toolkit-dev/openapi-core/endpoint";

/* -----------------------------------------------------------------------------
 * server
 * -------------------------------------------------------------------------- */

/**
 * Options for configuring the server toolkit.
 */
export type CreateServerToolkitOptions = {
  /**
   * TODO: Figure out auth
   */
  security?: {
    schemes: ComponentsObject["securitySchemes"];
    validators: Record<string, (c: Context) => Promise<Response>>;
  };
};

/**
 *
 */
export function createServerToolkit<Options extends CreateServerToolkitOptions>(
  options: Options = {} as Options,
) {
  /**
   *
   */
  function endpointPath<E extends Endpoint>(
    endpoint: E,
  ): E["__internal__"]["path"] {
    return endpoint.__internal__.path;
  }

  /**
   *
   */
  function endpointMethod<E extends Endpoint>(
    endpoint: E,
  ): E["__internal__"]["method"] {
    return endpoint.__internal__.method;
  }

  /**
   *
   */
  function endpointMiddleware<E extends Endpoint>(
    endpoint: E,
  ): EndpointMiddleware<E> {
    return every(
      validator("query", (value) => validateRequestQuery(endpoint, value)),
      validator("header", (value) => validateRequestHeader(endpoint, value)),
      validator("cookie", (value) => validateRequestCookie(endpoint, value)),
      validator("param", (value) => validateRequestPath(endpoint, value)),
      validator("json", (value) => validateRequestBody(endpoint, value)),
    );
  }

  /**
   *
   */
  async function endpointResponse<
    E extends Endpoint,
    S extends GetResponseStatusCodes<E>,
  >(
    endpoint: E,
    c: Context,
    options: {
      status: S;
      headers?: HeaderRecord;
      data: GetResponseContentInput<E, S>;
    },
  ): EndpointResponse<E, S> {
    // NOTE: We have to assign this to any rather than unknown to ensure that
    // the json call below is not excessively deep. While not ideal, the
    // data input and return function return types should be strict enough to
    // protect against any issues passing data through.
    const data: any = await validateResponseContent(
      endpoint,
      options.status,
      options.data,
    );

    return c.json(data, options.status);
  }

  return {
    endpointPath,
    endpointMethod,
    endpointMiddleware,
    endpointResponse,
  };
}

/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

/**
 * Inlined because hono does ot expose the HeaderRecordType
 */
export type HeaderRecord =
  | Record<"Content-Type", BaseMime>
  | Record<ResponseHeader, string | string[]>;

/**
 * Get the response type for an endpoint.
 */
export type EndpointResponse<
  E extends Endpoint,
  S extends ContentfulStatusCode,
> = Promise<
  Response & TypedResponse<GetResponseContentOutput<E, S>, S, "json">
>;

/**
 * Takes an ZodOpenApiOperationObject and returns a strictly typed validator
 * middleware type.
 */
export type EndpointMiddleware<E extends Endpoint> = MiddlewareHandler<
  any,
  string,
  TemplateInput<"json", GetRequestBodySchema<E>> &
    TemplateInput<"param", GetRequestParamSchema<E, "path">> &
    TemplateInput<"header", GetRequestParamSchema<E, "header">> &
    TemplateInput<"query", GetRequestParamSchema<E, "query">> &
    TemplateInput<"cookie", GetRequestParamSchema<E, "cookie">>
>;

/**
 * Helper used to template the schema inputs and outputs in a format that hono
 * can use.
 */
export type TemplateInput<K extends string, V> = V extends StandardSchemaV1
  ? {
      in: { [k in K]: StandardSchemaV1.InferInput<V> };
      out: { [k in K]: StandardSchemaV1.InferOutput<V> };
    }
  : {};
