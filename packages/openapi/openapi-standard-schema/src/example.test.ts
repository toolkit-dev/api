/**
 * Example usage of openapi-standard-schema types
 *
 * This test demonstrates how to use the StandardSchema-based OpenAPI types
 * to define APIs with direct schema references instead of string-based $ref.
 */

/* eslint-disable camelcase */

import { describe, it, expect } from "vitest";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { OpenAPIV3_0 } from "./versions/openapi-standard-schema-3-0.js";

// Mock StandardSchema implementation for testing
function createMockSchema<T>(value: T): StandardSchemaV1<T, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "mock",
      validate: (input: unknown) => ({ value: input as T }),
      types: {
        input: value,
        output: value,
      },
    },
  };
}

describe("OpenAPI Standard Schema Types", () => {
  it("should support direct schema references without $ref", () => {
    // Define schemas using mock StandardSchema
    const UserSchema = createMockSchema({
      id: "string",
      name: "string",
      email: "string",
    });

    const TodoSchema = createMockSchema({
      id: "string",
      title: "string",
      completed: false,
    });

    // Create an OpenAPI document using direct references
    const document: OpenAPIV3_0.OpenAPIObject = {
      openapi: "3.0.4",
      info: {
        title: "Example API",
        version: "1.0.0",
      },
      paths: {
        "/users/{id}": {
          get: {
            operationId: "getUser",
            parameters: {
              path: UserSchema, // Direct reference to schema
            },
            responses: {
              "200": {
                description: "Success",
                content: {
                  "application/json": {
                    schema: UserSchema, // Direct reference, no $ref
                  },
                },
              },
            },
          },
        },
        "/todos": {
          post: {
            operationId: "createTodo",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: TodoSchema, // Direct reference
                },
              },
            },
            responses: {
              "201": {
                description: "Created",
                content: {
                  "application/json": {
                    schema: TodoSchema,
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: UserSchema, // Can still define reusable schemas
          Todo: TodoSchema,
        },
      },
    };

    // Verify the structure compiles and has expected shape
    expect(document.openapi).toBe("3.0.4");
    expect(document.paths["/users/{id}"]?.get?.operationId).toBe("getUser");
    expect(document.paths["/todos"]?.post?.operationId).toBe("createTodo");
    expect(document.components?.schemas?.User).toBeDefined();
    expect(document.components?.schemas?.Todo).toBeDefined();
  });

  it("should support responses without ReferenceObject unions", () => {
    const ErrorSchema = createMockSchema({
      message: "string",
      code: "string",
    });

    const responses: OpenAPIV3_0.ResponsesObject = {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      "404": {
        description: "Not Found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      default: {
        description: "Error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    };

    // All response values are ResponseObject, not ReferenceObject | ResponseObject
    expect(responses["200"].description).toBe("Success");
    expect(responses["404"].description).toBe("Not Found");
    expect(responses.default?.description).toBe("Error");
  });

  it("should support MediaTypeObject with examples", () => {
    const UserSchema = createMockSchema({
      id: "string",
      name: "string",
    });

    const mediaType: OpenAPIV3_0.MediaTypeObject = {
      schema: UserSchema,
      example: {
        id: "123",
        name: "John Doe",
      },
      examples: {
        user1: {
          summary: "Example user",
          value: {
            id: "123",
            name: "John Doe",
          },
        },
      },
    };

    // MediaTypeObject has schema and examples directly
    expect(mediaType.schema).toBeDefined();
    expect(mediaType.example).toBeDefined();
    expect(mediaType.examples?.user1).toBeDefined();
  });

  it("should support PathItemObject without $ref", () => {
    const UserSchema = createMockSchema({ id: "string" });

    const pathItem: OpenAPIV3_0.PathItemObject = {
      summary: "User operations",
      get: {
        operationId: "getUser",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: UserSchema,
              },
            },
          },
        },
      },
    };

    // PathItemObject no longer has $ref property
    expect(pathItem.summary).toBe("User operations");
    expect(pathItem.get?.operationId).toBe("getUser");
    // @ts-expect-error - $ref should not exist
    expect(pathItem.$ref).toBeUndefined();
  });

  it("should support ComponentsObject without ReferenceObject", () => {
    const UserSchema = createMockSchema({ id: "string" });
    const ErrorResponse: OpenAPIV3_0.ResponseObject = {
      description: "Error",
      content: {
        "application/json": {
          schema: createMockSchema({ message: "string" }),
        },
      },
    };

    const components: OpenAPIV3_0.ComponentsObject = {
      schemas: {
        User: UserSchema,
      },
      responses: {
        ErrorResponse, // Direct reference, not ReferenceObject | ResponseObject
      },
      parameters: {
        userId: {
          path: UserSchema,
        },
      },
    };

    expect(components.schemas?.User).toBeDefined();
    expect(components.responses?.ErrorResponse).toBeDefined();
    expect(components.parameters?.userId).toBeDefined();
  });
});
