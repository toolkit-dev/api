/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRouter } from "@tanstack/react-router";

// lib
import { rootRoute } from "./routes/root-route.js";
import { homeRoute } from "./routes/home-route.js";
import { postRoute } from "./routes/post-route.js";
import { postCreateRoute } from "./routes/post-create-route.js";
import { userRoute } from "./routes/user-route.js";
import { usersRoute } from "./routes/users-route.js";

/* -----------------------------------------------------------------------------
 * router
 * -------------------------------------------------------------------------- */

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    postRoute,
    postCreateRoute,
    userRoute,
    usersRoute,
  ]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
