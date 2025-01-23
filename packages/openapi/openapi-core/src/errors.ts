/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { StandardSchemaV1 } from "@standard-schema/spec";

/* -----------------------------------------------------------------------------
 * errors
 * -------------------------------------------------------------------------- */

/**
 * Validate a value against a standard schema.
 */
export class ValidationError extends Error {
  /**
   * The issues that occurred during validation.
   */
  issues: readonly StandardSchemaV1.Issue[];

  constructor(issues: readonly StandardSchemaV1.Issue[]) {
    // TODO: Determine if there can be a better message here.
    super(JSON.stringify(issues, null, 2));
    this.issues = issues;
  }
}
