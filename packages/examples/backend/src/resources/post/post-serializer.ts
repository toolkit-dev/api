/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { ms } from "itty-time";

// lib
import { BASE_URL } from "../../config.js";
import { jtk } from "../../toolkit/jtk.js";
import { Post } from "./post-model.js";
import { postResourceSchema } from "./post-schemas.js";

/* -----------------------------------------------------------------------------
 * Post Serializer
 * -------------------------------------------------------------------------- */

export const postSerializer = jtk
  .createResourceSerializer("post")
  .schema(postResourceSchema)
  .resolver(async (ids) => await Post.findByIds(ids))
  .links((post) => ({
    self: `${BASE_URL}/post/${post.id}`,
  }))
  .relationships((post, ctx) => ({
    author: postUsersRelationSerializer.serialize(post, ctx),
  }))
  .meta(() => ({
    staleTime: ms("15 seconds"),
    gcTime: ms("1 minute"),
  }))
  .done();

export const postUsersRelationSerializer = jtk
  .createRelationshipSerializer("post", "author")
  .data((post, ctx) => ({
    type: "user",
    id: post.authorId,
  }))
  .links((post) => ({
    self: `${BASE_URL}/post/${post.id}/relationships/author`,
    related: `${BASE_URL}/post/${post.id}/bars`,
  }))
  .done();

export const postItemDocumentSerializer = jtk
  .createResourceDocumentSerializer("post", "itemDocumentOutput")
  .links((post) => ({
    self: `${BASE_URL}/post/${post.id}`,
  }))
  .meta(() => ({
    staleTime: ms("15 seconds"),
    gcTime: ms("1 minute"),
  }))
  .done();

export const postListDocumentSerializer = jtk
  .createResourceDocumentSerializer("post", "listDocumentOutput")
  .links(() => ({
    self: `${BASE_URL}/post`,
  }))
  .meta(() => ({
    staleTime: ms("15 seconds"),
    gcTime: ms("1 minute"),
  }))
  .done();
