/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { StandardSchemaV1 } from "@standard-schema/spec";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { z } from "zod";
import {
  createDocument,
  ZodOpenApiObject,
  ZodOpenApiOperationObject,
  ZodOpenApiPathsObject,
} from "zod-openapi";

// toolkit
import {
  getOptionsParamSchema,
  GetSecuritySchemes,
  SchemaCreators,
} from "@toolkit-dev/openapi-core/document";
import {
  Endpoint,
  EndpointOperation,
  EndpointMethod,
  GetRequestParamSchema,
  EndpointRequestParams,
  getRequestParamSchema,
  EndpointTree,
  isEndpoint,
  GetResponses,
  EndpointResponses,
} from "@toolkit-dev/openapi-core/endpoint";

/* -----------------------------------------------------------------------------
 * document
 *
 * TODO:
 * - Strictly type the operation to only allow defined security schemes in the
 *   security object.
 * -------------------------------------------------------------------------- */

/**
 * The initial schema required to create a document toolkit
 *
 * TODO: This whole thing needs to be brought into common types. It shouldn't
 * be zod specific.
 */
type DocumentSchema = Omit<ZodOpenApiObject, "paths">;

/**
 * Options for creating a document toolkit.
 */
export type CreateDocumentToolkitZodOptions<
  Schema extends DocumentSchema = DocumentSchema,
> = {
  /**
   * The base schema for the document.
   */
  schema: Schema;

  /**
   * Adds custom schema creators for each request parameter type. These hooks
   * will run on each endpoint creation and the results will be set on
   * corresponding param before merging in any params passed in as fetch
   * options.
   */
  schemaCreators?: SchemaCreators;

  /**
   * Adds global responses to each endpoint created. Useful for adding error
   * responses to all endpoints.
   */
  responses?: EndpointResponses;
};

/**
 * Create a document toolkit.
 */
export function createDocumentToolkit<
  Options extends CreateDocumentToolkitZodOptions,
>(options: Options) {
  /**
   * Creates an "endpoint" object containing properties and methods that can be
   * used to handle a hono route.
   */
  function endpoint<
    Method extends EndpointMethod,
    Path extends string,
    Operation extends EndpointOperation,
  >(
    method: Method,
    path: Path,
    { responses, ...operation }: Operation,
  ): GetBuiltEndpoint<Method, Path, Operation, Options> {
    const endpoint = {
      // We return under the __internal__ key here as a way to discourage folks
      // from grabbing properties directly off of the endpoint. Instead, they
      // should use the accessor methods provided by the api/clients.
      __internal__: { method, path, operation },
    };

    const requestParams: EndpointRequestParams = {};
    const cookieParam = buildRequestParamSchema(endpoint, "cookie");
    const headerParam = buildRequestParamSchema(endpoint, "header");
    const pathParam = buildRequestParamSchema(endpoint, "path");
    const queryParam = buildRequestParamSchema(endpoint, "query");

    if (cookieParam) requestParams.cookie = cookieParam;
    if (headerParam) requestParams.header = headerParam;
    if (pathParam) requestParams.path = pathParam;
    if (queryParam) requestParams.query = queryParam;

    endpoint.__internal__.operation = {
      ...operation,
      requestParams,
      responses: {
        ...options.responses,
        ...responses,
      },
    };

    // TODO: Fix this any assertion if it is possible.
    return endpoint as any;
  }

  /**
   * Create a document from the endpoints.
   */
  function document(endpoints: EndpointTree): OpenAPIObject {
    function buildPaths(endpoints: EndpointTree) {
      const paths: ZodOpenApiPathsObject = {};

      for (const node of Object.values(endpoints)) {
        if (isEndpoint(node)) {
          const path = node.__internal__.path.replace(/:(\w+)/g, "{$1}");
          const method = node.__internal__.method;
          const operation = node.__internal__.operation;

          paths[path] ??= {};
          paths[path][method] ??= operation as ZodOpenApiOperationObject;
        } else {
          Object.assign(paths, buildPaths(node));
        }
      }

      return paths;
    }

    return createDocument({
      ...options.schema,
      paths: buildPaths(endpoints),
    });
  }

  /**
   * Returns the security schemes defined in the document. This is used by the
   * server toolkit to enforce endpoints use defined security schemes and by the
   * client toolkit to generate the correct security headers.
   */
  function securitySchemas() {
    // Not clear why ts is deciding is widening the type here. If I access the
    // object directly, it is not widened, but for some reason, if returned
    // from a function, it is widened.
    return options.schema.components?.securitySchemes as GetSecuritySchemes<
      Options["schema"]
    >;
  }

  /**
   *
   */
  function buildRequestParamSchema<
    E extends Endpoint,
    P extends keyof EndpointRequestParams,
  >(endpoint: E, paramKey: P) {
    const endpointParamSchema = getRequestParamSchema(endpoint, paramKey);
    const optionsParamSchema = getOptionsParamSchema(
      endpoint,
      paramKey,
      options,
    );

    if (endpointParamSchema && !isZodObject(endpointParamSchema)) {
      throw new Error(
        `Request param schema for ${paramKey} is not a zod object.`,
      );
    }

    if (optionsParamSchema && !isZodObject(optionsParamSchema)) {
      throw new Error(
        `Options param schema for ${paramKey} is not a zod object.`,
      );
    }

    if (!endpointParamSchema && !optionsParamSchema) {
      return undefined;
    }

    return z.object({
      ...(endpointParamSchema?.shape || {}),
      ...(optionsParamSchema?.shape || {}),
    });
  }

  return {
    endpoint,
    securitySchemas,
    document,
  };
}

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

/**
 * Check if a value is a zod type.
 */
const isZodObject = (value: unknown): value is z.ZodObject<any, any, any> => {
  return value instanceof z.ZodObject;
};

/* -----------------------------------------------------------------------------
 * type helpers
 * -------------------------------------------------------------------------- */

/**
 * Get the built endpoint based on document options.
 */
type GetBuiltEndpoint<
  Method extends EndpointMethod,
  Path extends string,
  Operation extends EndpointOperation,
  Options extends CreateDocumentToolkitZodOptions,
> = {
  __internal__: {
    method: Method;
    path: Path;
    operation: GetBuiltEndpointOperation<
      Endpoint<Method, Path, Operation>,
      Options
    >;
  };
};

/**
 * Get the built endpoint operation based on document options.
 */
type GetBuiltEndpointOperation<
  E extends Endpoint,
  Options extends CreateDocumentToolkitZodOptions,
> = Omit<E["__internal__"]["operation"], "requestParams" | "responses"> & {
  requestParams: GetBuiltEndpointRequestParam<E, "cookie", Options> &
    GetBuiltEndpointRequestParam<E, "header", Options> &
    GetBuiltEndpointRequestParam<E, "path", Options> &
    GetBuiltEndpointRequestParam<E, "query", Options>;
  responses: GetBuiltEndpointResponses<E, Options>;
};

/**
 * Get the built request param schema based on document options.
 */
type GetBuiltEndpointRequestParam<
  E extends Endpoint,
  K extends keyof EndpointRequestParams,
  O extends CreateDocumentToolkitZodOptions,
> = {
  [key in K]: MergeParamSchemas<
    GetRequestParamSchema<E, K>,
    GetSchemaCreatorRequestParam<O, K>
  >;
};

/**
 * Get the built responses based on document options.
 */
type GetBuiltEndpointResponses<
  E extends Endpoint,
  O extends CreateDocumentToolkitZodOptions,
> =
  GetResponses<E> extends EndpointResponses
    ? O["responses"] extends EndpointResponses
      ? GetResponses<E> & O["responses"]
      : GetResponses<E>
    : O["responses"] extends EndpointResponses
      ? O["responses"]
      : never;

/**
 * Get the schema creator for a request param.
 */
type GetSchemaCreatorRequestParam<
  O extends CreateDocumentToolkitZodOptions,
  K extends keyof EndpointRequestParams,
> = O["schemaCreators"] extends {
  requestParams: { [key in K]: any };
}
  ? ReturnType<O["schemaCreators"]["requestParams"][K]>
  : unknown;

/**
 * Merge two standard schemas object into a single intersection type.
 */
type MergeParamSchemas<
  S1 extends StandardSchemaV1 | unknown,
  S2 extends StandardSchemaV1 | unknown,
> = S1 extends z.ZodType
  ? S2 extends z.ZodType
    ? z.ZodIntersection<S1, S2>
    : S1
  : S2 extends z.ZodType
    ? S2
    : undefined;
