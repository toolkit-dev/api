/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// This registers the additional zod-openapi methods onto the zod object.
import "zod-openapi/extend";

// 3rd party
import { z } from "zod";

/* -----------------------------------------------------------------------------
 * zod utils
 * -------------------------------------------------------------------------- */

export const includeSchema = (allowedIncludes: string[]) => {
  const allowedIncludesSet = new Set(allowedIncludes);

  return z
    .string()
    .default("")
    .transform((val) => (val ? val.split(",") : []))
    .refine(
      (val) => val.every((include) => allowedIncludesSet.has(include)),
      (val) => ({
        message: `Invalid include: ${val.join(", ")}`,
      }),
    );
};

/* -----------------------------------------------------------------------------
 * re-export zod
 *
 * All usage of zod should import from here. We do this to ensure that the
 * zod-openapi methods are available in the project.
 * -------------------------------------------------------------------------- */

export { z };
