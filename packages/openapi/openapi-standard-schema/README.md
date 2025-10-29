# openapi-standard-schema

> Types for defining OpenAPI documents with StandardSchema shapes

- Single source of truth: define your API once and use the same types to generate documentation, client code, and runtime validation.
- Validator-agnostic: built with StandardSchema, so your types work seamlessly with any compatible validation library like Zod or Yup.
- Consistent contracts: reduce duplication and keep your documentation, runtime validation, and type definitions fully aligned.

## How it works

The core idea is simple: whenever OpenAPI normally uses a schema (like in request bodies, parameters, or responses), we replace that whole section with a `StandardSchemaV1` type instead.

Think of it as collapsing schema-heavy parts into StandardSchema while keeping the rest of OpenAPI exactly as it is.

### Type mappings

The following sections describe the specific changes made to support StandardSchema in place of OpenAPI schema objects.

#### Removed Types

This package does **not** include the traditional OpenAPI schema types that are found in standard OpenAPI specifications. The following types have been intentionally removed:

- `SchemaObject` - Replaced by `StandardSchemaV1`
- `BaseSchemaObject` - Replaced by `StandardSchemaV1`
- `NonArraySchemaObject` - Replaced by `StandardSchemaV1`
- `ArraySchemaObject` - Replaced by `StandardSchemaV1`
- `DiscriminatorObject` - No longer needed with StandardSchema
- `XMLObject` - No longer needed with StandardSchema

**Why?** These OpenAPI-specific schema types add complexity and duplication. Instead, we use `StandardSchemaV1` directly everywhere a schema is needed. This approach:

- Eliminates the need for type conversions between OpenAPI schemas and validation schemas
- Allows you to define your API shape once using your validation library of choice (Zod, Yup, etc.)
- Enables references to be created at compile time when generating OpenAPI spec files, rather than being managed in the type system

If you need to reference schemas, use the `ReferenceObject` type which remains available for components that genuinely need reference semantics (like reusable responses or request bodies).

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

We keep the `content` map with media type keys (like `"application/json"`), but each media type points directly to a StandardSchema describing your request body.

```typescript
// Each media type maps directly to your data shape
{
  content: {
    "application/json": StandardSchemaV1;
    // Add more media types as needed
  }
}
```

### Responses

Responses stay organized by status code, and each status code maps media types directly to StandardSchemas.

```typescript
// Each status code -> media type -> response schema
{
  200: {
    "application/json": StandardSchemaV1;
  };
  404: {
    "application/json": StandardSchemaV1;
  };
}
```

### Schemas

Whether you're defining reusable components or inline schemas, they're all StandardSchemaV1 types. We focus on the actual data structure and leave out the OpenAPI metadata.

```typescript
// Reusable component schemas
{
  schemas: {
    User: StandardSchemaV1;
    Todo: StandardSchemaV1;
  }
}

// Inline schemas work the same way
{
  responses: {
    201: {
      "application/json": StandardSchemaV1;
    };
  }
}
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
