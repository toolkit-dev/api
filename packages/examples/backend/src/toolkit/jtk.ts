/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// toolkit
import { createJsonapi } from "@jsonapi/serializer";
// lib
import { UserDefinition } from "../resources/user/user-schemas.js";
import { PostDefinition } from "../resources/post/post-schemas.js";
import { ErrorDefinition } from "../errors/error-schemas.js";

/* -----------------------------------------------------------------------------
 * jtk
 * -------------------------------------------------------------------------- */

export const jtk = createJsonapi<{
  resources: {
    user: UserDefinition;
    post: PostDefinition;
  };
  errors: {
    default: ErrorDefinition;
  };
}>()
  .fetchConcurrency(10)
  .serializerConcurrency(10)
  .done();

jtk.registerResourceSerializers(async () => {
  const [user, post] = await Promise.all([
    import("../resources/user/user-serializer.js"),
    import("../resources/post/post-serializer.js"),
  ]);

  return {
    user: user.userSerializer,
    post: post.postSerializer,
  };
});

jtk.registerErrorSerializers(async () => {
  const [error] = await Promise.all([import("../errors/error-serializer.js")]);

  return {
    default: error.errorSerializer,
  };
});

// TODO: Implement debugging
// TODO: Implement otel tracing
// serializeDocument
// serializeResource
// resolveIncludedResources
// resolveLevel (1)
// resolveLevel (2)
