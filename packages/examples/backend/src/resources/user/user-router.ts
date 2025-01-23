/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Hono } from "hono";

// lib
import { delayMiddleware } from "../../utils/delay-middleware.js";
import { stk } from "../../toolkit/stk.js";
import { userEndpoints } from "./user-endpoints.js";
import {
  userItemDocumentSerializer,
  userListDocumentSerializer,
} from "./user-serializer.js";
import { User } from "./user-model.js";
import { errorDocumentSerializer } from "../../errors/error-serializer.js";

/* -----------------------------------------------------------------------------
 * user router
 * -------------------------------------------------------------------------- */

const userRouter = new Hono();

userRouter.on(
  stk.endpointMethod(userEndpoints.list),
  stk.endpointPath(userEndpoints.list),
  stk.endpointMiddleware(userEndpoints.list),
  delayMiddleware(),
  async (c) => {
    const include = c.req.valid("query").include;
    const users = await User.findAll();

    return stk.endpointResponse(userEndpoints.list, c, {
      status: 200,
      data: await userListDocumentSerializer.serialize(users, { include }),
    });
  },
);

userRouter.on(
  stk.endpointMethod(userEndpoints.get),
  stk.endpointPath(userEndpoints.get),
  stk.endpointMiddleware(userEndpoints.get),
  delayMiddleware(),
  async (c) => {
    const id = c.req.valid("param").id;
    const include = c.req.valid("query").include;
    const user = await User.findById(id);

    if (!user) {
      return stk.endpointResponse(userEndpoints.get, c, {
        status: 404,
        data: await errorDocumentSerializer.serialize(
          Object.assign(new Error("User not found"), { id: "user-not-found" }),
        ),
      });
    }

    return stk.endpointResponse(userEndpoints.get, c, {
      status: 200,
      data: await userItemDocumentSerializer.serialize(user, { include }),
    });
  },
);

userRouter.on(
  stk.endpointMethod(userEndpoints.create),
  stk.endpointPath(userEndpoints.create),
  stk.endpointMiddleware(userEndpoints.create),
  delayMiddleware(),
  async (c) => {
    const { data } = c.req.valid("json");
    const include = c.req.valid("query").include;
    const user = await User.create(data.attributes);

    return stk.endpointResponse(userEndpoints.get, c, {
      status: 200,
      data: await userItemDocumentSerializer.serialize(user, { include }),
    });
  },
);

export default userRouter;
