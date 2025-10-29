/**
 * OpenAPI 3.0.4 TypeScript Type Definitions with StandardSchema Support
 *
 * This file contains comprehensive TypeScript type definitions for the
 * OpenAPI Specification v3.0.4, modified to use StandardSchema types
 * in place of OpenAPI schema objects. Portions of the documentation text are
 * derived from the OpenAPI Specification v3.0.4, which is licensed under
 * the Apache License 2.0.
 *
 * OpenAPI Specification: https://spec.openapis.org/oas/v3.0.4
 * License: https://github.com/OAI/OpenAPI-Specification/blob/main/LICENSE
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";

export namespace OpenAPIV3_0 {
  /**
   * Specification Extensions
   *
   * While the OpenAPI Specification tries to accommodate most use cases,
   * additional data can be added to extend the specification at certain
   * points. The extensions properties are implemented as patterned fields
   * that are always prefixed by "x-".
   */
  export interface SpecificationExtension {
    [extension: `x-${string}`]: any;
  }

  /**
   * OpenAPI Object
   *
   * This is the root document object of the OpenAPI document.
   */
  export interface OpenAPIObject extends SpecificationExtension {
    /**
     * This string MUST be the semantic version number of the
     * OpenAPI Specification version that the OpenAPI document uses.
     */
    openapi: "3.0.4";
    /**
     * Provides metadata about the API. The metadata MAY be used
     * by tooling as required.
     */
    info: InfoObject;
    /**
     * An array of Server Objects, which provide connectivity information
     * to a target server.
     */
    servers?: ServerObject[];
    /**
     * The available paths and operations for the API.
     */
    paths: PathsObject;
    /**
     * An element to hold various schemas for the specification.
     */
    components?: ComponentsObject;
    /**
     * A declaration of which security mechanisms can be used across the API.
     */
    security?: SecurityRequirementObject[];
    /**
     * A list of tags used by the specification with additional metadata.
     */
    tags?: TagObject[];
    /**
     * Additional external documentation.
     */
    externalDocs?: ExternalDocumentationObject;
  }

  /**
   * Info Object
   *
   * The object provides metadata about the API. The metadata MAY be used by
   * the clients if needed, and MAY be presented in editing or documentation
   * generation tools for convenience.
   */
  export interface InfoObject extends SpecificationExtension {
    /**
     * The title of the API.
     */
    title: string;
    /**
     * A short description of the API. CommonMark syntax MAY be used for
     * rich text representation.
     */
    description?: string;
    /**
     * A URL to the Terms of Service for the API. MUST be in the format
     * of a URL.
     */
    termsOfService?: string;
    /**
     * The contact information for the exposed API.
     */
    contact?: ContactObject;
    /**
     * The license information for the exposed API.
     */
    license?: LicenseObject;
    /**
     * The version of the OpenAPI document (which is distinct from
     * the OpenAPI Specification version or the API implementation version).
     */
    version: string;
  }

  /**
   * Contact Object
   *
   * Contact information for the exposed API.
   */
  export interface ContactObject extends SpecificationExtension {
    /**
     * The identifying name of the contact person/organization.
     */
    name?: string;
    /**
     * The URL pointing to the contact information. MUST be in the format
     * of a URL.
     */
    url?: string;
    /**
     * The email address of the contact person/organization. MUST be in the
     * format of an email address.
     */
    email?: string;
  }

  /**
   * License Object
   *
   * License information for the exposed API.
   */
  export interface LicenseObject extends SpecificationExtension {
    /**
     * The license name used for the API.
     */
    name: string;
    /**
     * A URL to the license used for the API. MUST be in the format of a URL.
     */
    url?: string;
  }

  /**
   * Server Object
   *
   * An object representing a Server.
   */
  export interface ServerObject extends SpecificationExtension {
    /**
     * A URL to the target host. This URL supports Server Variables
     * and MAY be relative, to indicate that the host location is relative to
     * the location where the OpenAPI document is being served.
     */
    url: string;
    /**
     * An optional string describing the host designated by the URL.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;
    /**
     * A map between a variable name and its value. The value is used for
     * substitution in the server's URL template.
     */
    variables?: { [variable: string]: ServerVariableObject };
  }

  /**
   * Server Variable Object
   *
   * An object representing a Server Variable for server URL template
   * substitution.
   */
  export interface ServerVariableObject extends SpecificationExtension {
    /**
     * An enumeration of string values to be used if the substitution options
     * are from a limited set. The array SHOULD NOT be empty.
     */
    enum?: string[];
    /**
     * The default value to use for substitution, which SHALL be
     * sent if an alternate value is not supplied.
     */
    default: string;
    /**
     * An optional description for the server variable. CommonMark syntax
     * MAY be used for rich text representation.
     */
    description?: string;
  }

  /**
   * Helper type for path patterns - must start with a forward slash
   */
  export type PathPattern = `/${string}`;

  /**
   * HTTP methods supported by OpenAPI
   */
  export type HttpMethod =
    | "get"
    | "put"
    | "post"
    | "delete"
    | "options"
    | "head"
    | "patch"
    | "trace";

  /**
   * Paths Object
   *
   * Holds the relative paths to the individual endpoints and their operations.
   * The path is appended to the URL from the Server Object in order to
   * construct the full URL.
   */
  export type PathsObject = SpecificationExtension & {
    [pattern in PathPattern]?: PathItemObject;
  };

  /**
   * Path Item Object
   *
   * Describes the operations available on a single path. A Path Item MAY be
   * empty, due to ACL constraints.
   */
  export interface PathItemObject extends SpecificationExtension {
    /**
     * Allows for an external definition of this path item. The referenced
     * structure MUST be in the format of a Path Item Object.
     */
    $ref?: string;
    /**
     * An optional, string summary, intended to apply to all operations in
     * this path.
     */
    summary?: string;
    /**
     * An optional, string description, intended to apply to all operations
     * in this path. CommonMark syntax MAY be used for rich text
     * representation.
     */
    description?: string;
    /**
     * An alternative server array to service all operations in this path.
     */
    servers?: ServerObject[];
    /**
     * Parameters that are applicable for all the operations under this path,
     * grouped by location (query, path, header, cookie).
     */
    parameters?: ParametersObject;
    /**
     * A definition of a GET operation on this path.
     */
    get?: OperationObject;
    /**
     * A definition of a PUT operation on this path.
     */
    put?: OperationObject;
    /**
     * A definition of a POST operation on this path.
     */
    post?: OperationObject;
    /**
     * A definition of a DELETE operation on this path.
     */
    delete?: OperationObject;
    /**
     * A definition of a OPTIONS operation on this path.
     */
    options?: OperationObject;
    /**
     * A definition of a HEAD operation on this path.
     */
    head?: OperationObject;
    /**
     * A definition of a PATCH operation on this path.
     */
    patch?: OperationObject;
    /**
     * A definition of a TRACE operation on this path.
     */
    trace?: OperationObject;
  }

  /**
   * Operation Object
   *
   * Describes a single API operation on a path.
   */
  export interface OperationObject extends SpecificationExtension {
    /**
     * A list of tags for API documentation control. Tags can be used for
     * logical grouping of operations by resources or any other qualifier.
     */
    tags?: string[];
    /**
     * A short summary of what the operation does.
     */
    summary?: string;
    /**
     * A verbose explanation of the operation behavior. CommonMark syntax
     * MAY be used for rich text representation.
     */
    description?: string;
    /**
     * Additional external documentation for this operation.
     */
    externalDocs?: ExternalDocumentationObject;
    /**
     * Unique string used to identify the operation. The id MUST be unique
     * among all operations described in the API.
     */
    operationId?: string;
    /**
     * Parameters that are applicable for this operation, grouped by location
     * (query, path, header, cookie).
     */
    parameters?: ParametersObject;
    /**
     * The request body applicable for this operation.
     */
    requestBody?: ReferenceObject | RequestBodyObject;
    /**
     * The list of possible responses as they are returned from
     * executing this operation.
     */
    responses: ResponsesObject;
    /**
     * A map of possible out-of band callbacks related to the parent
     * operation.
     */
    callbacks?: { [callback: string]: ReferenceObject | CallbackObject };
    /**
     * Declares this operation to be deprecated. Consumers SHOULD refrain
     * from usage of the declared operation.
     */
    deprecated?: boolean;
    /**
     * A declaration of which security mechanisms can be used for this
     * operation.
     */
    security?: SecurityRequirementObject[];
    /**
     * An alternative server array to service this operation.
     */
    servers?: ServerObject[];
  }

  /**
   * External Documentation Object
   *
   * Allows referencing an external document for extended documentation.
   */
  export interface ExternalDocumentationObject extends SpecificationExtension {
    /**
     * A short description of the target documentation. CommonMark syntax
     * MAY be used for rich text representation.
     */
    description?: string;
    /**
     * The URL for the target documentation. Value MUST be in the format
     * of a URL.
     */
    url: string;
  }

  /**
   * Parameters Object
   *
   * Groups parameters by their location (query, path, header, cookie).
   * Each group is represented as a StandardSchema where property names
   * correspond to parameter names.
   */
  export interface ParametersObject extends SpecificationExtension {
    /**
     * Query parameters as a StandardSchema object.
     */
    query?: StandardSchemaV1;
    /**
     * Path parameters as a StandardSchema object.
     * Required parameters are represented without optional modifiers,
     * optional parameters use optional modifiers.
     */
    path?: StandardSchemaV1;
    /**
     * Header parameters as a StandardSchema object.
     */
    header?: StandardSchemaV1;
    /**
     * Cookie parameters as a StandardSchema object.
     */
    cookie?: StandardSchemaV1;
  }

  /**
   * Header Object
   *
   * Describes a header that can be used in responses.
   * This is simplified compared to the standard OpenAPI specification
   * as we focus on the data shape via StandardSchema.
   */
  export interface HeaderObject extends SpecificationExtension {
    /**
     * A brief description of the header. This could contain examples of use.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;
    /**
     * Specifies that a header is deprecated and SHOULD be transitioned
     * out of usage.
     */
    deprecated?: boolean;
    /**
     * The schema defining the type used for the header.
     */
    schema?: StandardSchemaV1;
  }

  /**
   * Request Body Object
   *
   * Describes a single request body. Each media type maps directly to a
   * StandardSchemaV1 describing the request body shape.
   */
  export interface RequestBodyObject extends SpecificationExtension {
    /**
     * A brief description of the request body. This could contain examples of
     * use. CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;
    /**
     * The content of the request body. The key is a media type or media type
     * range and the value is a StandardSchemaV1 describing the request body.
     */
    content: { [media: string]: StandardSchemaV1 };
    /**
     * Determines if the request body is required in the request. Defaults
     * to false.
     */
    required?: boolean;
  }

  /**
   * Media Type Object
   *
   * Each Media Type Object provides schema and examples for the media type
   * identified by its key. The schema is represented as a StandardSchemaV1.
   */
  export interface MediaTypeObject extends SpecificationExtension {
    /**
     * The schema defining the content of the request, response, or parameter.
     * Uses StandardSchemaV1 to describe the data shape.
     */
    schema?: StandardSchemaV1;
    /**
     * Example of the media type.
     */
    example?: any;
    /**
     * Examples of the media type. Each example object SHOULD match the media
     * type and specified schema if present.
     */
    examples?: { [name: string]: ReferenceObject | ExampleObject };
    /**
     * A map between a property name and its encoding information. The key,
     * being the property name, MUST exist in the schema as a property.
     */
    encoding?: { [name: string]: EncodingObject };
  }

  /**
   * Encoding Object
   *
   * A single encoding definition applied to a single schema property.
   */
  export interface EncodingObject extends SpecificationExtension {
    /**
     * The Content-Type for encoding a specific property. Default value depends
     * on the property type.
     */
    contentType?: string;
    /**
     * A map allowing additional information to be provided as headers.
     */
    headers?: { [header: string]: ReferenceObject | HeaderObject };
    /**
     * Describes how a specific property value will be serialized depending
     * on its type.
     */
    style?: string;
    /**
     * When this is true, property values of type array or object generate
     * separate parameters for each value of the array, or key-value-pair
     * of the map.
     */
    explode?: boolean;
    /**
     * Determines whether the parameter value SHOULD allow reserved characters,
     * as defined by RFC3986.
     */
    allowReserved?: boolean;
  }

  /**
   * Helper type for HTTP status codes
   */
  export type HttpStatusCode = `${1 | 2 | 3 | 4 | 5}${number}${number}`;

  /**
   * Responses Object
   *
   * A container for the expected responses of an operation. The container maps
   * a HTTP response code to the expected response.
   */
  export type ResponsesObject = SpecificationExtension & {
    default?: ReferenceObject | ResponseObject;
  } & { [status in HttpStatusCode]?: ReferenceObject | ResponseObject };

  /**
   * Response Object
   *
   * Describes a single response from an API Operation. Each media type maps
   * directly to a StandardSchemaV1 describing the response shape.
   */
  export interface ResponseObject extends SpecificationExtension {
    /**
     * A short description of the response. CommonMark syntax MAY be used
     * for rich text representation.
     */
    description: string;
    /**
     * Maps a header name to its definition. RFC7230 states header names
     * are case insensitive.
     */
    headers?: { [header: string]: ReferenceObject | HeaderObject };
    /**
     * A map containing descriptions of potential response payloads. The key
     * is a media type or media type range and the value is a StandardSchemaV1
     * describing the response body.
     */
    content?: { [media: string]: StandardSchemaV1 };
    /**
     * A map of operations links that can be followed from the response.
     * The key of the map is a short name for the link.
     */
    links?: { [link: string]: ReferenceObject | LinkObject };
  }

  /**
   * Callback Object
   *
   * A map of possible out-of band callbacks related to the parent operation.
   * Each value in the map is a Path Item Object that describes a request that
   * may be initiated by the API provider and the expected responses.
   */
  export interface CallbackObject extends SpecificationExtension {
    /**
     * A Path Item Object used to define a callback request and expected
     * responses.
     */
    [expression: string]: PathItemObject;
  }

  /**
   * Example Object
   *
   * In all cases, the example value is expected to be compatible with the
   * type schema of its associated value.
   */
  export interface ExampleObject extends SpecificationExtension {
    /**
     * Short description for the example.
     */
    summary?: string;
    /**
     * Long description for the example. CommonMark syntax MAY be used
     * for rich text representation.
     */
    description?: string;
    /**
     * Embedded literal example. The value field and externalValue field
     * are mutually exclusive.
     */
    value?: any;
    /**
     * A URL that points to the literal example. This provides the capability
     * to reference examples that cannot easily be included in JSON or YAML
     * documents.
     */
    externalValue?: string;
  }

  /**
   * Link Object
   *
   * The Link object represents a possible design-time link for a response.
   * The presence of a link does not guarantee the caller's ability to
   * successfully invoke it, rather it provides known metadata and structure
   * for a response.
   */
  export interface LinkObject extends SpecificationExtension {
    /**
     * A relative or absolute URI reference to an OAS operation. This field
     * is mutually exclusive of the operationId field.
     */
    operationRef?: string;
    /**
     * The name of an existing, resolvable OAS operation, as defined with
     * a unique operationId. This field is mutually exclusive of the
     * operationRef field.
     */
    operationId?: string;
    /**
     * A map representing parameters to pass to an operation as specified
     * with operationId or identified via operationRef.
     */
    parameters?: { [parameter: string]: any };
    /**
     * A literal value or {expression} to use as a request body when calling
     * the target operation.
     */
    requestBody?: any;
    /**
     * A description of the link. CommonMark syntax MAY be used for rich
     * text representation.
     */
    description?: string;
    /**
     * A server object to be used by the target operation.
     */
    server?: ServerObject;
  }

  /**
   * Reference Object
   *
   * A simple object to allow referencing other components in the
   * specification, internally and externally.
   */
  export interface ReferenceObject extends SpecificationExtension {
    /**
     * The reference string.
     */
    $ref: string;
  }

  /**
   * Schema Object
   *
   * The Schema Object allows the definition of input and output data types.
   * These types can be objects, but also primitives and arrays.
   */
  export type SchemaObject = NonArraySchemaObject | ArraySchemaObject;

  /**
   * Base Schema Object
   *
   * Common properties for all schema objects, based on JSON Schema Draft 7
   * with OpenAPI-specific extensions.
   */
  export interface BaseSchemaObject extends SpecificationExtension {
    /**
     * Can be used to decorate a user interface with information about
     * the data produced by this user interface.
     */
    title?: string;
    /**
     * A description will provide explanation about the purpose of the
     * instance described by this schema.
     */
    description?: string;
    /**
     * See JSON Schema Core and JSON Schema Validation for more information
     * about the use of default.
     */
    default?: any;
    /**
     * See JSON Schema Validation for more information about the use of
     * multipleOf.
     */
    multipleOf?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * maximum.
     */
    maximum?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * exclusiveMaximum.
     */
    exclusiveMaximum?: boolean;
    /**
     * See JSON Schema Validation for more information about the use of
     * minimum.
     */
    minimum?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * exclusiveMinimum.
     */
    exclusiveMinimum?: boolean;
    /**
     * See JSON Schema Validation for more information about the use of
     * maxLength.
     */
    maxLength?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * minLength.
     */
    minLength?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * pattern.
     */
    pattern?: string;
    /**
     * See JSON Schema Validation for more information about the use of
     * maxItems.
     */
    maxItems?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * minItems.
     */
    minItems?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * uniqueItems.
     */
    uniqueItems?: boolean;
    /**
     * See JSON Schema Validation for more information about the use of
     * maxProperties.
     */
    maxProperties?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * minProperties.
     */
    minProperties?: number;
    /**
     * See JSON Schema Validation for more information about the use of
     * required.
     */
    required?: string[];
    /**
     * See JSON Schema Validation for more information about the use of enum.
     */
    enum?: any[];
    /**
     * Value can be an object or a boolean. When additionalProperties is true,
     * the type of additional properties is unrestricted.
     */
    additionalProperties?: boolean | ReferenceObject | SchemaObject;
    /**
     * Property definitions MUST be a Schema Object and not a standard JSON
     * Schema.
     */
    properties?: { [name: string]: ReferenceObject | SchemaObject };
    /**
     * Value MUST be an array. This array SHOULD have at least one element.
     * Elements in the array SHOULD be unique.
     */
    allOf?: (ReferenceObject | SchemaObject)[];
    /**
     * Value MUST be an array. This array SHOULD have at least one element.
     * Elements in the array SHOULD be unique.
     */
    oneOf?: (ReferenceObject | SchemaObject)[];
    /**
     * Value MUST be an array. This array SHOULD have at least one element.
     * Elements in the array SHOULD be unique.
     */
    anyOf?: (ReferenceObject | SchemaObject)[];
    /**
     * This attribute is a schema that validates any instance that is not
     * valid against the "not" schema.
     */
    not?: ReferenceObject | SchemaObject;
    /**
     * See Data Type Formats for further details. While relying on JSON Schema's
     * defined formats, the OAS offers a few additional predefined formats.
     */
    format?: string;
    /**
     * Allows sending a null value for the defined schema. Default value is
     * false.
     */
    nullable?: boolean;
    /**
     * Adds support for polymorphism. The discriminator is an object name that
     * is used to differentiate between other schemas which may satisfy the
     * payload description.
     */
    discriminator?: DiscriminatorObject;
    /**
     * Declares the property as "read only". This means that it MAY be sent as
     * part of a response but SHOULD NOT be sent as part of the request.
     */
    readOnly?: boolean;
    /**
     * Declares the property as "write only". Therefore, it MAY be sent as part
     * of a request but SHOULD NOT be sent as part of the response.
     */
    writeOnly?: boolean;
    /**
     * This MAY be used only on properties schemas. It has no effect on root
     * schemas. Adds additional metadata to describe the XML representation of
     * this property.
     */
    xml?: XMLObject;
    /**
     * Additional external documentation for this schema.
     */
    externalDocs?: ExternalDocumentationObject;
    /**
     * A free-form example of the schema. To represent examples that cannot be
     * naturally represented in JSON or YAML, a string value can be used to
     * contain the example with escaping where necessary.
     */
    example?: any;
    /**
     * Specifies that a schema is deprecated and SHOULD be transitioned out of
     * usage. Default value is false.
     */
    deprecated?: boolean;
  }

  /**
   * Non-Array Schema Object
   *
   * Schema object for non-array types.
   */
  export interface NonArraySchemaObject extends BaseSchemaObject {
    /**
     * Value MUST be a string. Multiple types via an array are not supported.
     */
    type?: "boolean" | "object" | "number" | "string" | "integer";
  }

  /**
   * Array Schema Object
   *
   * Schema object specifically for array types.
   */
  export interface ArraySchemaObject extends BaseSchemaObject {
    /**
     * Value MUST be a string. For arrays, the type MUST be "array".
     */
    type: "array";
    /**
     * Value MUST be an object and not an array. Inline or referenced schema
     * MUST be of a Schema Object and not a standard JSON Schema.
     */
    items: ReferenceObject | SchemaObject;
  }

  /**
   * Discriminator Object
   *
   * When request bodies or response payloads may be one of a number of
   * different schemas, a discriminator object can be used to aid in
   * serialization, deserialization, and validation.
   */
  export interface DiscriminatorObject extends SpecificationExtension {
    /**
     * The name of the property in the payload that will hold the discriminator
     * value.
     */
    propertyName: string;
    /**
     * An object to hold mappings between payload values and schema names or
     * references.
     */
    mapping?: { [value: string]: string };
  }

  /**
   * XML Object
   *
   * A metadata object that allows for more fine-tuned XML model definitions.
   */
  export interface XMLObject extends SpecificationExtension {
    /**
     * Replaces the name of the element/attribute used for the described schema
     * property.
     */
    name?: string;
    /**
     * The URI of the namespace definition. Value MUST be in the form of an
     * absolute URI.
     */
    namespace?: string;
    /**
     * The prefix to be used for the name.
     */
    prefix?: string;
    /**
     * Declares whether the property definition translates to an attribute
     * instead of an element. Default value is false.
     */
    attribute?: boolean;
    /**
     * MAY be used only for an array definition. Signifies whether the array is
     * wrapped or not. Default value is false.
     */
    wrapped?: boolean;
  }

  /**
   * Security Requirement Object
   *
   * Lists the required security schemes to execute this operation. The object
   * can have multiple security schemes declared in it which are all required
   * (that is, there is a logical AND between the schemes).
   */
  export interface SecurityRequirementObject extends SpecificationExtension {
    /**
     * Each name MUST correspond to a security scheme which is declared in the
     * Security Schemes under the Components Object.
     */
    [name: string]: string[];
  }

  /**
   * Components Object
   *
   * Holds a set of reusable objects for different aspects of the OAS. All
   * objects defined within the components object will have no effect on the
   * API unless they are explicitly referenced from properties outside the
   * components object.
   */
  export interface ComponentsObject extends SpecificationExtension {
    /**
     * An object to hold reusable schemas. Each schema is represented as
     * a StandardSchemaV1.
     */
    schemas?: { [key: string]: StandardSchemaV1 };
    /**
     * An object to hold reusable Response Objects.
     */
    responses?: { [key: string]: ReferenceObject | ResponseObject };
    /**
     * An object to hold reusable Parameters Objects.
     */
    parameters?: { [key: string]: ParametersObject };
    /**
     * An object to hold reusable Example Objects.
     */
    examples?: { [key: string]: ReferenceObject | ExampleObject };
    /**
     * An object to hold reusable Request Body Objects.
     */
    requestBodies?: { [key: string]: ReferenceObject | RequestBodyObject };
    /**
     * An object to hold reusable Header Objects.
     */
    headers?: { [key: string]: ReferenceObject | HeaderObject };
    /**
     * An object to hold reusable Security Scheme Objects.
     */
    securitySchemes?: { [key: string]: ReferenceObject | SecuritySchemeObject };
    /**
     * An object to hold reusable Link Objects.
     */
    links?: { [key: string]: ReferenceObject | LinkObject };
    /**
     * An object to hold reusable Callback Objects.
     */
    callbacks?: { [key: string]: ReferenceObject | CallbackObject };
  }

  /**
   * Security Scheme Object
   *
   * Defines a security scheme that can be used by the operations. Supported
   * schemes are HTTP authentication, an API key (either as a header, a cookie
   * parameter or as a query parameter), OAuth2's common flows (implicit,
   * password, client credentials and authorization code) as defined in
   * RFC6749, and OpenID Connect Discovery.
   */
  export type SecuritySchemeObject =
    | ApiKeySecurityScheme
    | HttpSecurityScheme
    | OAuth2SecurityScheme
    | OpenIdConnectSecurityScheme;

  /**
   * API Key Security Scheme
   *
   * Defines an API key security scheme.
   */
  export interface ApiKeySecurityScheme extends SpecificationExtension {
    /**
     * The type of the security scheme. Valid values are "apiKey", "http",
     * "oauth2", "openIdConnect".
     */
    type: "apiKey";
    /**
     * A short description for security scheme. CommonMark syntax MAY be used
     * for rich text representation.
     */
    description?: string;
    /**
     * The name of the header, query or cookie parameter to be used.
     */
    name: string;
    /**
     * The location of the API key. Valid values are "query", "header" or
     * "cookie".
     */
    in: "query" | "header" | "cookie";
  }

  /**
   * HTTP Security Scheme
   *
   * Defines an HTTP security scheme.
   */
  export interface HttpSecurityScheme extends SpecificationExtension {
    /**
     * The type of the security scheme. Valid values are "apiKey", "http",
     * "oauth2", "openIdConnect".
     */
    type: "http";
    /**
     * A short description for security scheme. CommonMark syntax MAY be used
     * for rich text representation.
     */
    description?: string;
    /**
     * The name of the HTTP Authorization scheme to be used in the Authorization
     * header as defined in RFC7235.
     */
    scheme: string;
    /**
     * A hint to the client to identify how the bearer token is formatted.
     * Bearer tokens are usually generated by an authorization server, so this
     * information is primarily for documentation purposes.
     */
    bearerFormat?: string;
  }

  /**
   * OAuth2 Security Scheme
   *
   * Defines an OAuth2 security scheme.
   */
  export interface OAuth2SecurityScheme extends SpecificationExtension {
    /**
     * The type of the security scheme. Valid values are "apiKey", "http",
     * "oauth2", "openIdConnect".
     */
    type: "oauth2";
    /**
     * A short description for security scheme. CommonMark syntax MAY be used
     * for rich text representation.
     */
    description?: string;
    /**
     * An object containing configuration information for the flow types
     * supported.
     */
    flows: OAuthFlowsObject;
  }

  /**
   * OAuth Flows Object
   *
   * Allows configuration of the supported OAuth Flows.
   */
  export interface OAuthFlowsObject extends SpecificationExtension {
    /**
     * Configuration for the OAuth Implicit flow
     */
    implicit?: OAuthFlowImplicit;
    /**
     * Configuration for the OAuth Resource Owner Password flow
     */
    password?: OAuthFlowPassword;
    /**
     * Configuration for the OAuth Client Credentials flow. Previously called
     * application in OpenAPI 2.0.
     */
    clientCredentials?: OAuthFlowClientCredentials;
    /**
     * Configuration for the OAuth Authorization Code flow. Previously called
     * accessCode in OpenAPI 2.0.
     */
    authorizationCode?: OAuthFlowAuthorizationCode;
  }

  /**
   * OAuth Flow (Implicit)
   *
   * Configuration details for a supported OAuth Flow
   */
  export interface OAuthFlowImplicit extends SpecificationExtension {
    /**
     * The authorization URL to be used for this flow. This MUST be in the form
     * of a URL.
     */
    authorizationUrl: string;
    /**
     * The URL to be used for obtaining refresh tokens. This MUST be in the
     * form of a URL.
     */
    refreshUrl?: string;
    /**
     * The available scopes for the OAuth2 security scheme. A map between the
     * scope name and a short description for it. The map MAY be empty.
     */
    scopes: { [scope: string]: string };
  }

  /**
   * OAuth Flow (Password)
   *
   * Configuration details for a supported OAuth Flow
   */
  export interface OAuthFlowPassword extends SpecificationExtension {
    /**
     * The token URL to be used for this flow. This MUST be in the form of a
     * URL.
     */
    tokenUrl: string;
    /**
     * The URL to be used for obtaining refresh tokens. This MUST be in the
     * form of a URL.
     */
    refreshUrl?: string;
    /**
     * The available scopes for the OAuth2 security scheme. A map between the
     * scope name and a short description for it. The map MAY be empty.
     */
    scopes: { [scope: string]: string };
  }

  /**
   * OAuth Flow (Client Credentials)
   *
   * Configuration details for a supported OAuth Flow
   */
  export interface OAuthFlowClientCredentials extends SpecificationExtension {
    /**
     * The token URL to be used for this flow. This MUST be in the form of a
     * URL.
     */
    tokenUrl: string;
    /**
     * The URL to be used for obtaining refresh tokens. This MUST be in the
     * form of a URL.
     */
    refreshUrl?: string;
    /**
     * The available scopes for the OAuth2 security scheme. A map between the
     * scope name and a short description for it. The map MAY be empty.
     */
    scopes: { [scope: string]: string };
  }

  /**
   * OAuth Flow (Authorization Code)
   *
   * Configuration details for a supported OAuth Flow
   */
  export interface OAuthFlowAuthorizationCode extends SpecificationExtension {
    /**
     * The authorization URL to be used for this flow. This MUST be in the form
     * of a URL.
     */
    authorizationUrl: string;
    /**
     * The token URL to be used for this flow. This MUST be in the form of a
     * URL.
     */
    tokenUrl: string;
    /**
     * The URL to be used for obtaining refresh tokens. This MUST be in the
     * form of a URL.
     */
    refreshUrl?: string;
    /**
     * The available scopes for the OAuth2 security scheme. A map between the
     * scope name and a short description for it. The map MAY be empty.
     */
    scopes: { [scope: string]: string };
  }

  /**
   * OpenID Connect Security Scheme
   *
   * Defines an OpenID Connect security scheme.
   */
  export interface OpenIdConnectSecurityScheme extends SpecificationExtension {
    /**
     * The type of the security scheme. Valid values are "apiKey", "http",
     * "oauth2", "openIdConnect".
     */
    type: "openIdConnect";
    /**
     * A short description for security scheme. CommonMark syntax MAY be used
     * for rich text representation.
     */
    description?: string;
    /**
     * OpenId Connect URL to discover OAuth2 configuration values. This MUST be
     * in the form of a URL.
     */
    openIdConnectUrl: string;
  }

  /**
   * Tag Object
   *
   * Adds metadata to a single tag that is used by the Operation Object. It is
   * not mandatory to have a Tag Object per tag defined in the Operation
   * Object instances.
   */
  export interface TagObject extends SpecificationExtension {
    /**
     * The name of the tag.
     */
    name: string;
    /**
     * A short description for the tag. CommonMark syntax MAY be used for rich
     * text representation.
     */
    description?: string;
    /**
     * Additional external documentation for this tag.
     */
    externalDocs?: ExternalDocumentationObject;
  }
}
