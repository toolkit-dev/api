/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

//lib
import { errorDocumentSchema } from "../../errors/error-schemas.js";
import { dtk } from "../../toolkit/dtk.js";
import { z, includeSchema } from "../../utils/zod.js";
import {
  userItemDocumentSchema,
  usersListDocumentSchema,
  createUserResourceDocumentSchema,
} from "./user-schemas.js";

/* -----------------------------------------------------------------------------
 * user endpoints
 * -------------------------------------------------------------------------- */

// type T =
//   (typeof userEndpoints)["list"]["__internal__"]["operation"]["responses"];
// type T1 = T[200];
// type T2 = T[500]

export const userEndpoints = {
  list: dtk.endpoint("get", "/user", {
    tags: ["User"],
    summary: "List Users",
    description: "List all users",
    requestParams: {
      query: z.object({
        include: includeSchema(["foo"]),
      }),
    },
    responses: {
      200: {
        description: "Ok",
        content: {
          "application/json": {
            schema: usersListDocumentSchema,
          },
        },
      },
    },
  }),

  get: dtk.endpoint("get", "/user/:id", {
    tags: ["User"],
    summary: "Get User",
    description: "Get a user by id",
    requestParams: {
      path: z.object({ id: z.string() }),
      query: z.object({
        include: includeSchema(["foo"]),
      }),
    },
    responses: {
      200: {
        description: "Ok",
        content: {
          "application/json": {
            schema: userItemDocumentSchema,
          },
        },
      },
      404: {
        description: "Not Found",
        content: {
          "application/json": {
            schema: errorDocumentSchema,
          },
        },
      },
    },
  }),

  create: dtk.endpoint("post", "/user", {
    tags: ["User"],
    summary: "Create User",
    description: "Create a user",
    requestParams: {
      query: z.object({
        include: includeSchema(["foo"]),
      }),
    },
    requestBody: {
      content: {
        "application/json": {
          schema: createUserResourceDocumentSchema,
        },
      },
    },
    responses: {
      200: {
        description: "Ok",
        content: {
          "application/json": {
            schema: userItemDocumentSchema,
          },
        },
      },
    },
  }),
};
