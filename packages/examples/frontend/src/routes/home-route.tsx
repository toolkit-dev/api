/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRoute } from "@tanstack/react-router";
import { Container, Typography } from "@mui/material";

// lib
import { rootRoute } from "./root-route.js";
import { PostsList } from "../features/posts-list.js";
/* -----------------------------------------------------------------------------
 * homeRoute
 * -------------------------------------------------------------------------- */

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

export function HomePage() {
  return (
    <Container maxWidth="xl" sx={{ marginTop: 4 }}>
      <Typography mb={2} variant="h2">
        Posts
      </Typography>
      <PostsList />
    </Container>
  );
}
