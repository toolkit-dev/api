/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { StandardSchemaV1 } from "@standard-schema/spec";
import { ValidationError } from "./errors.js";
import { Simplify } from "type-fest";

/* -----------------------------------------------------------------------------
 * schema utils
 * -------------------------------------------------------------------------- */

/**
 * Get the output type of a standard schema.
 *
 * NOTE: We wrap this in simplify to improve the output of intersection types
 * which can be difficult to read.
 */
export type GetSchemaOutput<T> = T extends StandardSchemaV1
  ? Simplify<StandardSchemaV1.InferOutput<T>>
  : unknown;

/**
 * Get the input type of a standard schema.
 *
 * NOTE: We wrap this in simplify to improve the output of intersection types
 * which can be difficult to read.
 */
export type GetSchemaInput<T> = T extends StandardSchemaV1
  ? Simplify<StandardSchemaV1.InferInput<T>>
  : unknown;

/**
 * Validate a value against a standard schema.
 */
export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, the validation failed
  if (result.issues) {
    throw new ValidationError(result.issues);
  }

  return result.value;
}
