/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { jtk } from "../toolkit/jtk.js";
import { errorObjectSchema } from "./error-schemas.js";

/* -----------------------------------------------------------------------------
 * Error Serializer
 * -------------------------------------------------------------------------- */

export const errorSerializer = jtk
  .createErrorSerializer("default")
  .schema(errorObjectSchema)
  .transform((error) => ({
    id: error.id,
    status: "",
    title: "",
    detail: "",
    source: {
      pointer: "",
      parameter: "",
      header: "",
    },
  }))
  .done();

export const errorDocumentSerializer = jtk
  .createErrorDocumentSerializer("default")
  .done();
