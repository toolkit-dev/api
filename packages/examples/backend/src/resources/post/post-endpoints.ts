/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

//lib
import { dtk } from "../../toolkit/dtk.js";
import { z, includeSchema } from "../../utils/zod.js";
import {
  postItemDocumentSchema,
  postsListDocumentSchema,
  createPostResourceDocumentSchema,
} from "./post-schemas.js";

/* -----------------------------------------------------------------------------
 * post endpoints
 * -------------------------------------------------------------------------- */

export const postEndpoints = {
  list: dtk.endpoint("get", "/post", {
    tags: ["Post"],
    summary: "List Posts",
    description: "List all posts",
    requestParams: {
      query: z.object({
        authorId: z.string().optional(),
        include: includeSchema(["author"]),
      }),
    },
    responses: {
      200: {
        description: "Ok",
        content: {
          "application/json": {
            schema: postsListDocumentSchema,
          },
        },
      },
    },
  }),

  get: dtk.endpoint("get", "/post/:id", {
    tags: ["Post"],
    summary: "Get Post",
    description: "Get a post by id",
    requestParams: {
      path: z.object({ id: z.string() }),
      query: z.object({
        include: includeSchema(["author"]),
      }),
    },
    responses: {
      200: {
        description: "Ok",
        content: {
          "application/json": {
            schema: postItemDocumentSchema,
          },
        },
      },
      404: {
        description: "Not Found",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  }),

  create: dtk.endpoint("post", "/post", {
    tags: ["Post"],
    summary: "Create Post",
    description: "Create a post",
    requestParams: {
      query: z.object({
        include: includeSchema(["author"]),
      }),
    },
    requestBody: {
      content: {
        "application/json": {
          schema: createPostResourceDocumentSchema,
        },
      },
    },
    responses: {
      200: {
        description: "Ok",
        content: {
          "application/json": {
            schema: postItemDocumentSchema,
          },
        },
      },
    },
  }),
};
