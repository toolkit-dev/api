/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { z } from "../utils/zod.js";

/* -----------------------------------------------------------------------------
 * Error definition
 * -------------------------------------------------------------------------- */

export type ErrorDefinition = {
  input: Error & { id: string | number };
  objectOutput: ErrorObject;
  documentOutput: ErrorDocument;
};

/* -----------------------------------------------------------------------------
 * Error schemas
 * -------------------------------------------------------------------------- */

export type ErrorObject = z.output<typeof errorObjectSchema>;
export const errorObjectSchema = j.errorObject({
  id: z.string(),
  status: z.string(),
  title: z.string(),
  detail: z.string().optional(),
  source: z
    .object({
      pointer: z.string().optional(),
      parameter: z.string().optional(),
      header: z.string().optional(),
    })
    .optional(),
});

export type ErrorDocument = z.output<typeof errorDocumentSchema>;
export const errorDocumentSchema = j.errorDocument({
  errors: z.array(errorObjectSchema),
});
