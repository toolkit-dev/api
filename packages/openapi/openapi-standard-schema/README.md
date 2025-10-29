# openapi-standard-schema

> Types for defining OpenAPI documents with StandardSchema shapes

- Single source of truth: define your API once and use the same types to generate documentation, client code, and runtime validation.
- Validator-agnostic: built with StandardSchema, so your types work seamlessly with any compatible validation library like Zod or Yup.
- Consistent contracts: reduce duplication and keep your documentation, runtime validation, and type definitions fully aligned.

## How it works

The core idea is simple: whenever OpenAPI normally uses a schema (like in request bodies, parameters, or responses), we replace that whole section with a `StandardSchemaV1` type instead.

Think of it as collapsing schema-heavy parts into StandardSchema while keeping the rest of OpenAPI exactly as it is.

## Design philosophy

### Direct references over string-based references

This package eliminates OpenAPI's `$ref` (ReferenceObject) pattern in favor of direct TypeScript references. Instead of using string-based references like `{ $ref: "#/components/schemas/User" }`, you include the actual schema object directly:

```typescript
// ❌ Traditional OpenAPI with string references
const response = {
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/User" },
    },
  },
};

// ✅ StandardSchema approach with direct references
const response = {
  content: {
    "application/json": {
      schema: UserSchema, // Direct TypeScript reference
    },
  },
};
```

This approach provides:

- **Type safety**: TypeScript can validate your schemas at compile time
- **Better IDE support**: Jump to definition, refactoring, and autocomplete work seamlessly
- **Simpler mental model**: No need to manage a separate components registry
- **Code reusability**: Share schemas across your application naturally

When you need to compile your code-defined schemas to an OpenAPI YAML/JSON document, a separate compilation step can transform direct references into `$ref` strings where it makes sense for the output format.

### StandardSchemaV1 replaces SchemaObject

Traditional OpenAPI uses `SchemaObject` types with properties like `type`, `properties`, `items`, `required`, etc. This package eliminates those types entirely - your validation library (Zod, Yup, etc.) handles schema definition through `StandardSchemaV1`.

```typescript
// ❌ Traditional OpenAPI SchemaObject
const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name"],
};

// ✅ StandardSchema with Zod (or any other StandardSchema-compatible library)
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number().optional(),
});
```

This means:

- Schema definitions live in code with full type inference
- Runtime validation uses the same schema as type definitions
- No duplication between TypeScript types and OpenAPI schemas
- Metadata (descriptions, examples) can be added using your validation library's methods (e.g., Zod's `.describe()`).

## Type mappings

The following sections describe the specific changes made to support StandardSchema in place of OpenAPI schema objects.

### Parameters

Instead of OpenAPI's array of parameters, we group them by where they live: `query`, `path`, `header`, or `cookie`. Each group becomes a StandardSchema object where:

- Property names are your parameter names
- Required parameters don't have `?`, optional ones do
- Transport details (like `style` or `explode`) aren't included—just the data shape

```typescript
// Parameters grouped by location
{
  query: StandardSchemaV1;
  path: StandardSchemaV1;
  header?: StandardSchemaV1;
  cookie?: StandardSchemaV1;
}
```

### Request body

We keep the `content` map with media type keys (like `"application/json"`), but each media type points to a `MediaTypeObject` containing a StandardSchema describing your request body.

```typescript
// Each media type maps to a MediaTypeObject with a schema
{
  content: {
    "application/json": {
      schema: StandardSchemaV1;
      example?: any;
      examples?: { [name: string]: ExampleObject };
    }
    // Add more media types as needed
  }
}
```

### Responses

Responses stay organized by status code. Each response contains a `content` object that maps media types to `MediaTypeObject` with StandardSchemas.

```typescript
// Each status code -> ResponseObject with content
{
  200: {
    description: "Success";
    content: {
      "application/json": {
        schema: StandardSchemaV1;
      }
    }
  };
  404: {
    description: "Not found";
    content: {
      "application/json": {
        schema: StandardSchemaV1;
      }
    }
  };
}
```

### Schemas

Whether you're defining reusable components or inline schemas, they're all StandardSchemaV1 types. We focus on the actual data structure. Instead of managing separate component registries with string-based references, you define schemas in code and reference them directly.

```typescript
import { z } from "zod";

// Define your schemas with your validation library
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  completed: z.boolean(),
  userId: z.string().uuid(),
});

// Use them directly in your OpenAPI document
const apiDocument = {
  components: {
    schemas: {
      User: UserSchema,
      Todo: TodoSchema,
    },
  },
  paths: {
    "/users/{id}": {
      get: {
        responses: {
          200: {
            description: "User found",
            content: {
              "application/json": {
                schema: UserSchema, // Direct reference, no $ref needed
              },
            },
          },
        },
      },
    },
  },
};
```

### Headers

Response headers map directly to StandardSchema types. Metadata like descriptions can be tracked on the schema's metadata (e.g., Zod's `.describe()` method).

```typescript
// Headers map directly to StandardSchemaV1
{
  headers: {
    "X-Rate-Limit": StandardSchemaV1;
    "X-Request-Id": StandardSchemaV1;
  }
}
```
