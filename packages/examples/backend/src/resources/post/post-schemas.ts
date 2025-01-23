/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { z } from "../../utils/zod.js";
import { Post } from "./post-model.js";
import { userResourceSchema } from "../user/user-schemas.js";

/* -----------------------------------------------------------------------------
 * Post definition
 * -------------------------------------------------------------------------- */

export type PostDefinition = {
  input: Post;
  resourceOutput: PostResource;
  itemDocumentOutput: PostItemDocument;
  listDocumentOutput: PostsListDocument;
};

/* -----------------------------------------------------------------------------
 * Post fields
 * -------------------------------------------------------------------------- */

export type PostFields = z.output<typeof postFields>;
export const postFields = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
});

/* -----------------------------------------------------------------------------
 * Post schema
 * -------------------------------------------------------------------------- */

export const postAttributes = postFields.omit({
  id: true,
  authorId: true,
});

export type PostResource = z.output<typeof postResourceSchema>;
export const postResourceSchema = j
  .resource({
    type: z.literal("post"),
    id: z.string(),
    attributes: postAttributes,
    relationships: z.object({
      author: j.oneToOneRelationship({
        data: j.resourceIdentifier({ type: z.literal("user"), id: z.string() }),
        links: z.object({ self: z.string(), related: z.string() }),
      }),
    }),
    links: z.object({
      self: z.string(),
    }),
    meta: z.object({
      staleTime: z.number(),
      gcTime: z.number(),
    }),
  })
  .openapi({
    ref: "Post",
  });

export type PostItemDocument = z.output<typeof postItemDocumentSchema>;
export const postItemDocumentSchema = j.resourceDocument({
  data: postResourceSchema,
  included: z.array(userResourceSchema),
  links: z.object({
    self: z.string(),
  }),
  meta: z.object({
    staleTime: z.number(),
    gcTime: z.number(),
  }),
});

export type PostsListDocument = z.output<typeof postsListDocumentSchema>;
export const postsListDocumentSchema = j.resourceDocument({
  data: z.array(postResourceSchema),
  included: z.array(userResourceSchema),
  links: z.object({
    self: z.string(),
  }),
  meta: z.object({
    staleTime: z.number(),
    gcTime: z.number(),
  }),
});

export type CreatePostResource = z.output<typeof createPostResourceSchema>;
export const createPostResourceSchema = j.resourceCreate({
  type: z.literal("post"),
  attributes: postAttributes,
  relationships: z.object({
    author: j.oneToOneRelationship({
      data: j.resourceIdentifier({ type: z.literal("user"), id: z.string() }),
    }),
  }),
});

export type CreatePostItemDocument = z.output<
  typeof createPostResourceDocumentSchema
>;
export const createPostResourceDocumentSchema = j.resourceCreateDocument({
  data: createPostResourceSchema,
});
