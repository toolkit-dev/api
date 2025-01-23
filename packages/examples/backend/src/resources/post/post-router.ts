/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Hono } from "hono";

// lib
import { delayMiddleware } from "../../utils/delay-middleware.js";
import { stk } from "../../toolkit/stk.js";
import { postEndpoints } from "./post-endpoints.js";
import {
  postItemDocumentSerializer,
  postListDocumentSerializer,
} from "./post-serializer.js";
import { Post } from "./post-model.js";

/* -----------------------------------------------------------------------------
 * post router
 * -------------------------------------------------------------------------- */

const postRouter = new Hono();

postRouter.on(
  stk.endpointMethod(postEndpoints.list),
  stk.endpointPath(postEndpoints.list),
  stk.endpointMiddleware(postEndpoints.list),
  delayMiddleware(),
  async (c) => {
    const { include, authorId } = c.req.valid("query");
    const posts = (await Post.findAll()).filter((post) =>
      authorId ? post.authorId === authorId : true,
    );

    return stk.endpointResponse(postEndpoints.list, c, {
      status: 200,
      data: await postListDocumentSerializer.serialize(posts, { include }),
    });
  },
);

postRouter.on(
  stk.endpointMethod(postEndpoints.get),
  stk.endpointPath(postEndpoints.get),
  stk.endpointMiddleware(postEndpoints.get),
  delayMiddleware(),
  async (c) => {
    const id = c.req.valid("param").id;
    const include = c.req.valid("query").include;
    const post = await Post.findById(id);

    if (!post) {
      return stk.endpointResponse(postEndpoints.get, c, {
        status: 404,
        data: { message: "Post not found" },
      });
    }

    return stk.endpointResponse(postEndpoints.get, c, {
      status: 200,
      data: await postItemDocumentSerializer.serialize(post, { include }),
    });
  },
);

postRouter.on(
  stk.endpointMethod(postEndpoints.create),
  stk.endpointPath(postEndpoints.create),
  stk.endpointMiddleware(postEndpoints.create),
  delayMiddleware(),
  async (c) => {
    const { data } = c.req.valid("json");
    const include = c.req.valid("query").include;
    const post = await Post.create({
      ...data.attributes,
      authorId: data.relationships.author.data.id,
    });

    return stk.endpointResponse(postEndpoints.get, c, {
      status: 200,
      data: await postItemDocumentSerializer.serialize(post, { include }),
    });
  },
);

export default postRouter;
