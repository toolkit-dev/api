/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { z } from "../../utils/zod.js";
import { User } from "./user-model.js";

/* -----------------------------------------------------------------------------
 * User definition
 * -------------------------------------------------------------------------- */

export type UserDefinition = {
  input: User;
  resourceOutput: UserResource;
  itemDocumentOutput: UserItemDocument;
  listDocumentOutput: UsersListDocument;
};

/* -----------------------------------------------------------------------------
 * User fields
 * -------------------------------------------------------------------------- */

export type UserFields = z.output<typeof userFields>;
export const userFields = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

/* -----------------------------------------------------------------------------
 * User resource
 * -------------------------------------------------------------------------- */

export const userAttributes = userFields.omit({
  id: true,
});

export type UserResource = z.output<typeof userResourceSchema>;
export const userResourceSchema = j
  .resource({
    type: z.literal("user"),
    id: z.string(),
    attributes: userAttributes,
    links: z.object({
      self: z.string(),
    }),
    meta: z.object({
      staleTime: z.number(),
      gcTime: z.number(),
    }),
  })
  .openapi({
    ref: "User",
  });

export type UserItemDocument = z.output<typeof userItemDocumentSchema>;
export const userItemDocumentSchema = j.resourceDocument({
  data: userResourceSchema,
  links: z.object({
    self: z.string(),
  }),
  meta: z.object({
    staleTime: z.number(),
    gcTime: z.number(),
  }),
});

export type UsersListDocument = z.output<typeof usersListDocumentSchema>;
export const usersListDocumentSchema = j.resourceDocument({
  data: z.array(userResourceSchema),
  links: z.object({
    self: z.string(),
  }),
  meta: z.object({
    staleTime: z.number(),
    gcTime: z.number(),
  }),
});

export type CreateUserResource = z.output<typeof createUserResourceSchema>;
export const createUserResourceSchema = userResourceSchema.omit({
  id: true,
  links: true,
});

export type CreateUserItemDocument = z.output<
  typeof createUserResourceDocumentSchema
>;
export const createUserResourceDocumentSchema = j.resourceDocument({
  data: userResourceSchema,
});
