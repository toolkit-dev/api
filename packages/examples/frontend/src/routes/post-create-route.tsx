/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRoute } from "@tanstack/react-router";
import { Container, Typography } from "@mui/material";

// lib
import { rootRoute } from "./root-route.js";
import { PostCreate } from "../features/post-create.js";

/* -----------------------------------------------------------------------------
 * postCreateRoute
 * -------------------------------------------------------------------------- */

export const postCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post/create",
  component: PostCreatePage,
});

export function PostCreatePage() {
  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography mb={2} variant="h2">
        Create Post
      </Typography>
      <PostCreate />
    </Container>
  );
}
