/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { StandardSchemaV1 } from "@standard-schema/spec";
import { Get } from "type-fest";

// lib
import { Endpoint, EndpointRequestParams } from "./endpoint.js";
import { ComponentsObject } from "openapi3-ts/oas31";

/* -----------------------------------------------------------------------------
 * document
 * -------------------------------------------------------------------------- */

/**
 * A function that creates a payload for a given endpoint.
 */
export type SchemaCreator = <E extends Endpoint>(
  endpoint: E,
) => StandardSchemaV1;

/**
 * The payload creators for the client toolkit.
 */
export type SchemaCreators = {
  requestParams?: {
    [K in "cookie" | "header" | "path" | "query"]?: SchemaCreator;
  };
};

/**
 * The return type of a payload creator for the request params.
 */
export type GetSchemaCreatorRequestParamReturn<
  P extends SchemaCreators | unknown,
  N extends keyof SchemaCreators["requestParams"],
> = P extends { requestParams: { [K in N]: SchemaCreator } }
  ? ReturnType<P["requestParams"][N]>
  : never;

/**
 * Get the security schemes from the document.
 */
export type GetSecuritySchemes<
  DocumentSchema extends {
    components?: { securitySchemes?: ComponentsObject["securitySchemes"] };
  },
> = Get<DocumentSchema, "components.securitySchemes">;

/**
 * Get the options param schema for an endpoint.
 */
export function getOptionsParamSchema<
  E extends Endpoint,
  Options extends { schemaCreators?: SchemaCreators },
>(endpoint: E, paramKey: keyof EndpointRequestParams, options: Options) {
  return options.schemaCreators?.requestParams?.[paramKey]?.(endpoint);
}
