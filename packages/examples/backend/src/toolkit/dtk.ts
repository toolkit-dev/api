/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// toolkit
import { errorDocumentSchema } from "../errors/error-schemas.js";
import { z } from "../utils/zod.js";
import { createDocumentToolkit } from "@toolkit-dev/openapi-document-zod";

/* -----------------------------------------------------------------------------
 * document toolkit (dtk)
 * -------------------------------------------------------------------------- */

export const dtk = createDocumentToolkit({
  schema: {
    openapi: "3.1.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  schemaCreators: {
    requestParams: {
      header: (endpoint) => {
        return z.object({
          "content-type": z.string(),
          "x-release-version": z.string(),
        });
      },
    },
  },

  responses: {
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: errorDocumentSchema,
        },
      },
    },
  },
});
